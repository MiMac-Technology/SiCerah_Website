import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type ClosingStatus =
  | 'Menunggu Rekonsiliasi'
  | 'Direkonsiliasi'
  | 'Selisih Ditandai'

export type DailyClosing = {
  id: string
  date: string
  trxCount: number
  systemTotal: number
  physicalCash: number
  /** physicalCash - systemTotal: positif = lebih, negatif = kurang. */
  difference: number
  notes?: string
  status: ClosingStatus
  submittedAt: string
  reconciledAt?: string
}

export type SubmitClosingInput = {
  date: string
  trxCount: number
  systemTotal: number
  physicalCash: number
  notes?: string
}

type CashClosingState = {
  closings: DailyClosing[]
  submitClosing: (input: SubmitClosingInput, actorRole: Role) => void
  reconcileClosing: (id: string, actorRole: Role) => void
  flagClosing: (id: string, actorRole: Role) => void
}

function seedClosings(): DailyClosing[] {
  faker.seed(9009)
  return Array.from({ length: 6 }, (_, i) => {
    const systemTotal = faker.number.int({ min: 500_000, max: 4_000_000 })
    const diff = faker.helpers.arrayElement([0, 0, 0, -15000, 8000])
    const date = new Date()
    date.setDate(date.getDate() - (i + 1))
    return {
      id: genId('close'),
      date: date.toISOString(),
      trxCount: faker.number.int({ min: 5, max: 40 }),
      systemTotal,
      physicalCash: systemTotal + diff,
      difference: diff,
      status: (i < 2 ? 'Menunggu Rekonsiliasi' : 'Direkonsiliasi') as ClosingStatus,
      submittedAt: date.toISOString(),
      reconciledAt: i < 2 ? undefined : date.toISOString(),
    }
  })
}

export const useCashClosingStore = create<CashClosingState>()(
  persist(
    (set) => ({
      closings: seedClosings(),
      submitClosing: (input, actorRole) => {
        const closing: DailyClosing = {
          ...input,
          id: genId('close'),
          difference: input.physicalCash - input.systemTotal,
          status: 'Menunggu Rekonsiliasi',
          submittedAt: new Date().toISOString(),
        }
        set((state) => ({ closings: [closing, ...state.closings] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Kasir',
          action: 'Submit tutup kas harian ke Bendahara',
          module: 'pos',
          targetId: closing.id,
          detail: `Sistem Rp${input.systemTotal.toLocaleString('id-ID')}, fisik Rp${input.physicalCash.toLocaleString('id-ID')}`,
        })
      },
      flagClosing: (id, actorRole) => {
        set((state) => ({
          closings: state.closings.map((c) =>
            c.id === id ? { ...c, status: 'Selisih Ditandai' } : c
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Menandai selisih kas (flag) pada tutup kas harian',
          module: 'pos',
          targetId: id,
        })
      },
      reconcileClosing: (id, actorRole) => {
        set((state) => ({
          closings: state.closings.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'Direkonsiliasi',
                  reconciledAt: new Date().toISOString(),
                }
              : c
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Merekonsiliasi tutup kas harian',
          module: 'pos',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-cash-closing-store' }
  )
)
