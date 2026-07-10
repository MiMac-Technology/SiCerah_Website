import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuditStore } from '@/stores/audit-store'

export type FinanceConfig = {
  /** Saldo kas awal (C0) saat setup sistem. Wajib diisi sebelum transaksi pertama. */
  initialCashBalance: number | null
  initialCashSetAt?: string
  /** Pengeluaran di atas nominal ini otomatis diumumkan ke seluruh anggota. */
  announcementThreshold: number
  /** Periode tutup buku (tahun buku). Dipakai untuk reset L_t dan hitung SHU final. */
  fiscalPeriodStart: string
  fiscalPeriodEnd: string
  updatedAt: string
}

type FinanceConfigState = {
  config: FinanceConfig
  setInitialCashBalance: (amount: number) => void
  updateAnnouncementThreshold: (amount: number) => void
  updateFiscalPeriod: (start: string, end: string) => void
}

const year = new Date().getFullYear()

const DEFAULT_CONFIG: FinanceConfig = {
  initialCashBalance: null,
  announcementThreshold: 500_000,
  fiscalPeriodStart: new Date(year, 0, 1).toISOString(),
  fiscalPeriodEnd: new Date(year, 11, 31).toISOString(),
  updatedAt: new Date().toISOString(),
}

function log(action: string, detail?: string) {
  useAuditStore.getState().logAction({
    activeRole: 'admin',
    actorLabel: 'Administrator',
    action,
    module: 'admin',
    detail,
  })
}

export const useFinanceConfigStore = create<FinanceConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setInitialCashBalance: (amount) => {
        set((state) => ({
          config: {
            ...state.config,
            initialCashBalance: amount,
            initialCashSetAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }))
        log(
          'Menetapkan saldo kas awal (C0)',
          `Rp${amount.toLocaleString('id-ID')}`
        )
      },
      updateAnnouncementThreshold: (amount) => {
        set((state) => ({
          config: {
            ...state.config,
            announcementThreshold: amount,
            updatedAt: new Date().toISOString(),
          },
        }))
        log(
          'Mengubah threshold auto-announce pengeluaran',
          `Rp${amount.toLocaleString('id-ID')}`
        )
      },
      updateFiscalPeriod: (start, end) => {
        set((state) => ({
          config: {
            ...state.config,
            fiscalPeriodStart: start,
            fiscalPeriodEnd: end,
            updatedAt: new Date().toISOString(),
          },
        }))
        log('Mengubah periode tutup buku')
      },
    }),
    { name: 'sicerah-finance-config-store' }
  )
)
