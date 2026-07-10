import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export const CASH_IN_TYPES = [
  'Simpanan Pokok',
  'Simpanan Wajib',
  'Simpanan Sukarela',
  'Angsuran Pinjaman',
  'Omzet Gerai Harian',
] as const

export type CashInType = (typeof CASH_IN_TYPES)[number]

export type CashIn = {
  id: string
  cashInNo: string
  date: string
  type: CashInType
  memberName?: string
  description: string
  amount: number
  /** Terisi jika entri ini adalah koreksi atas entri lain (append-only ledger). */
  correctionOfId?: string
  correctionOfNo?: string
  correctionReason?: string
  createdAt: string
}

export type AddCashInInput = {
  date: string
  type: CashInType
  memberName?: string
  description: string
  amount: number
}

type CashInState = {
  cashIns: CashIn[]
  addCashIn: (input: AddCashInInput, actorRole: Role) => void
  /**
   * Koreksi append-only: entri lama tidak diubah; entri baru berisi selisih
   * (newAmount - oldAmount) dan mereferensi entri lama. Keduanya tetap di ledger.
   */
  addCorrection: (
    originalId: string,
    newAmount: number,
    reason: string,
    actorRole: Role
  ) => void
}

function seedCashIns(): CashIn[] {
  faker.seed(1111)
  return Array.from({ length: 25 }, (_, i) => {
    const type = faker.helpers.arrayElement(CASH_IN_TYPES)
    const isMemberRelated = type !== 'Omzet Gerai Harian'
    return {
      id: genId('kmi'),
      cashInNo: `KM-${String(i + 1).padStart(4, '0')}`,
      date: faker.date.recent({ days: 30 }).toISOString(),
      type,
      memberName: isMemberRelated ? faker.person.fullName() : undefined,
      description:
        type === 'Omzet Gerai Harian'
          ? 'Rekap omzet gerai dari Kasir'
          : `${type} anggota`,
      amount:
        type === 'Omzet Gerai Harian'
          ? faker.number.int({ min: 800_000, max: 4_000_000 })
          : faker.number.int({ min: 25_000, max: 500_000 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
}

export const useCashInStore = create<CashInState>()(
  persist(
    (set, get) => ({
      cashIns: seedCashIns(),
      addCashIn: (input, actorRole) => {
        const entry: CashIn = {
          ...input,
          id: genId('kmi'),
          cashInNo: `KM-${String(get().cashIns.length + 1).padStart(4, '0')}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ cashIns: [entry, ...state.cashIns] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: `Mencatat kas masuk (${input.type})`,
          module: 'kas-keluar',
          targetId: entry.id,
          detail: `${entry.cashInNo} — Rp${input.amount.toLocaleString('id-ID')}`,
        })
      },
      addCorrection: (originalId, newAmount, reason, actorRole) => {
        const original = get().cashIns.find((c) => c.id === originalId)
        if (!original) return
        const delta = newAmount - original.amount
        const entry: CashIn = {
          id: genId('kmi'),
          cashInNo: `KM-${String(get().cashIns.length + 1).padStart(4, '0')}`,
          date: new Date().toISOString(),
          type: original.type,
          memberName: original.memberName,
          description: `Koreksi ${original.cashInNo}: ${reason}`,
          amount: delta,
          correctionOfId: original.id,
          correctionOfNo: original.cashInNo,
          correctionReason: reason,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ cashIns: [entry, ...state.cashIns] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Membuat entri koreksi kas masuk (append-only)',
          module: 'kas-keluar',
          targetId: entry.id,
          detail: `Koreksi ${original.cashInNo}: ${reason}`,
        })
      },
    }),
    { name: 'sicerah-cash-in-store' }
  )
)
