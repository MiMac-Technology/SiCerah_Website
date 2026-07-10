import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'

export type FlagTargetType = 'transaksi-pos' | 'kas-masuk' | 'kas-keluar'

export const FLAG_TARGET_LABELS: Record<FlagTargetType, string> = {
  'transaksi-pos': 'Transaksi POS',
  'kas-masuk': 'Kas Masuk',
  'kas-keluar': 'Kas Keluar',
}

export type AuditComment = {
  text: string
  at: string
  by: string
}

export type AuditFlag = {
  id: string
  targetType: FlagTargetType
  targetId: string
  /** Ringkasan target saat di-flag (no + nominal) agar laporan tetap terbaca. */
  targetLabel: string
  comments: AuditComment[]
  createdAt: string
  reportedAt?: string
}

type AuditFlagsState = {
  flags: AuditFlag[]
  /** Flag transaksi mencurigakan. Catatan bersifat read-add only — tidak ada aksi hapus/edit. */
  addFlag: (
    targetType: FlagTargetType,
    targetId: string,
    targetLabel: string,
    note: string
  ) => void
  addComment: (flagId: string, text: string) => void
  markReported: () => void
}

export const useAuditFlagsStore = create<AuditFlagsState>()(
  persist(
    (set) => ({
      flags: [],
      addFlag: (targetType, targetId, targetLabel, note) => {
        const flag: AuditFlag = {
          id: genId('flag'),
          targetType,
          targetId,
          targetLabel,
          comments: [
            { text: note, at: new Date().toISOString(), by: 'Pengawas' },
          ],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ flags: [flag, ...state.flags] }))
        useAuditStore.getState().logAction({
          activeRole: 'pengawas',
          actorLabel: 'Pengawas',
          action: `Menandai (flag) ${FLAG_TARGET_LABELS[targetType]} sebagai mencurigakan`,
          module: 'approval',
          targetId,
          detail: note,
        })
      },
      addComment: (flagId, text) => {
        set((state) => ({
          flags: state.flags.map((f) =>
            f.id === flagId
              ? {
                  ...f,
                  comments: [
                    ...f.comments,
                    { text, at: new Date().toISOString(), by: 'Pengawas' },
                  ],
                }
              : f
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: 'pengawas',
          actorLabel: 'Pengawas',
          action: 'Menambahkan catatan audit pada flag',
          module: 'approval',
          targetId: flagId,
        })
      },
      markReported: () => {
        const now = new Date().toISOString()
        set((state) => ({
          flags: state.flags.map((f) =>
            f.reportedAt ? f : { ...f, reportedAt: now }
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: 'pengawas',
          actorLabel: 'Pengawas',
          action: 'Mengirim laporan temuan audit ke Ketua',
          module: 'approval',
        })
      },
    }),
    { name: 'sicerah-audit-flags-store' }
  )
)
