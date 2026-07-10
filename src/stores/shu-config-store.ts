import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuditStore } from '@/stores/audit-store'

export type ShuConfig = {
  koperasiName: string
  fiscalYear: number
  jasaModalPct: number
  jasaUsahaPct: number
  cadanganPct: number
  danaSosialPct: number
  danaPengurusPct: number
  /** Nominal pengeluaran di atas ini butuh approval di Approval Center. */
  approvalThreshold: number
  updatedAt: string
  updatedBy: string
  /** Setelah RAT, Ketua mengunci parameter — tak bisa diubah sampai RAT berikutnya. */
  locked?: boolean
  lockedAt?: string
  lockedBy?: string
  lockedUntilLabel?: string
}

type ShuConfigState = {
  config: ShuConfig
  updateConfig: (
    partial: Partial<Omit<ShuConfig, 'updatedAt'>>,
    updatedBy: string
  ) => void
  lockParameters: (lockedUntilLabel: string) => void
  unlockParameters: () => void
}

const DEFAULT_CONFIG: ShuConfig = {
  koperasiName: 'Koperasi Sejahtera',
  fiscalYear: new Date().getFullYear(),
  jasaModalPct: 25,
  jasaUsahaPct: 40,
  cadanganPct: 20,
  danaSosialPct: 5,
  danaPengurusPct: 10,
  approvalThreshold: 2_000_000,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Bendahara',
}

export const useShuConfigStore = create<ShuConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (partial, updatedBy) =>
        set((state) => ({
          config: {
            ...state.config,
            ...partial,
            updatedAt: new Date().toISOString(),
            updatedBy,
          },
        })),
      lockParameters: (lockedUntilLabel) => {
        set((state) => ({
          config: {
            ...state.config,
            locked: true,
            lockedAt: new Date().toISOString(),
            lockedBy: 'Ketua',
            lockedUntilLabel,
          },
        }))
        useAuditStore.getState().logAction({
          activeRole: 'ketua',
          actorLabel: 'Ketua',
          action: `Mengunci parameter SHU & anggaran tahunan (hingga ${lockedUntilLabel})`,
          module: 'shu-config',
        })
      },
      unlockParameters: () => {
        set((state) => ({
          config: {
            ...state.config,
            locked: false,
            lockedAt: undefined,
            lockedBy: undefined,
            lockedUntilLabel: undefined,
          },
        }))
        useAuditStore.getState().logAction({
          activeRole: 'ketua',
          actorLabel: 'Ketua',
          action: 'Membuka kunci parameter tahunan (pasca-RAT)',
          module: 'shu-config',
        })
      },
    }),
    { name: 'sicerah-shu-config-store' }
  )
)
