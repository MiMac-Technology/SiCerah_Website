import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

type ShuConfigState = {
  config: ShuConfig
  updateConfig: (
    partial: Partial<Omit<ShuConfig, 'updatedAt'>>,
    updatedBy: string
  ) => void
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
    }),
    { name: 'sicerah-shu-config-store' }
  )
)
