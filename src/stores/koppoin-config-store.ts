import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'

/** Rate poin per aktivitas. Belanja/simpanan/setor panen: poin per Rp10.000; kehadiran rapat: poin per kehadiran. */
export type KopPoinRates = {
  belanjaPer10k: number
  simpananPer10k: number
  setorPanenPer10k: number
  kehadiranRapat: number
}

export type RewardType =
  | 'Diskon Belanja'
  | 'Potongan Simpanan'
  | 'Potongan Jasa Pinjaman'

export type RewardItem = {
  id: string
  name: string
  type: RewardType
  pointCost: number
  validUntil: string
}

export type RewardItemInput = Omit<RewardItem, 'id'>

type KopPoinConfigState = {
  rates: KopPoinRates
  catalog: RewardItem[]
  updateRates: (rates: KopPoinRates) => void
  addRewardItem: (data: RewardItemInput) => void
  deleteRewardItem: (id: string) => void
}

const DEFAULT_RATES: KopPoinRates = {
  belanjaPer10k: 10,
  simpananPer10k: 5,
  setorPanenPer10k: 15,
  kehadiranRapat: 50,
}

function seedCatalog(): RewardItem[] {
  faker.seed(8008)
  const items: { name: string; type: RewardType; pointCost: number }[] = [
    { name: 'Diskon belanja Rp5.000', type: 'Diskon Belanja', pointCost: 500 },
    { name: 'Diskon belanja Rp15.000', type: 'Diskon Belanja', pointCost: 1400 },
    { name: 'Potongan simpanan wajib 1 bulan', type: 'Potongan Simpanan', pointCost: 2000 },
    { name: 'Potongan jasa pinjaman 0,5%', type: 'Potongan Jasa Pinjaman', pointCost: 3000 },
  ]
  return items.map((item) => ({
    ...item,
    id: genId('rwd'),
    validUntil: faker.date.future({ years: 1 }).toISOString(),
  }))
}

export const useKopPoinConfigStore = create<KopPoinConfigState>()(
  persist(
    (set) => ({
      rates: DEFAULT_RATES,
      catalog: seedCatalog(),
      updateRates: (rates) => {
        set({ rates })
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: 'Memperbarui rate konversi KopPoin',
          module: 'admin',
        })
      },
      addRewardItem: (data) => {
        const item: RewardItem = { ...data, id: genId('rwd') }
        set((state) => ({ catalog: [item, ...state.catalog] }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: 'Menambah item katalog penukaran KopPoin',
          module: 'admin',
          targetId: item.id,
          detail: item.name,
        })
      },
      deleteRewardItem: (id) => {
        set((state) => ({
          catalog: state.catalog.filter((c) => c.id !== id),
        }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: 'Menghapus item katalog penukaran KopPoin',
          module: 'admin',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-koppoin-config-store' }
  )
)
