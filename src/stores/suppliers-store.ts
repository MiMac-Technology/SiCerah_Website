import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export const SUPPLIER_TYPES = [
  'Petani Lokal',
  'Pengrajin',
  'UMKM Desa',
  'Distributor',
] as const

export type SupplierType = (typeof SUPPLIER_TYPES)[number]

export type PricePoint = {
  date: string
  price: number
  note?: string
}

export type Supplier = {
  id: string
  name: string
  contactPhone: string
  commodity: string
  type: SupplierType
  priceHistory: PricePoint[]
  /** Evaluasi performa (dasar keputusan reorder). */
  onTimePct: number
  qualityScore: number
  priceConsistencyScore: number
  createdAt: string
}

export type AddSupplierInput = Pick<
  Supplier,
  'name' | 'contactPhone' | 'commodity' | 'type'
> & { initialPrice?: number }

type SuppliersState = {
  suppliers: Supplier[]
  addSupplier: (input: AddSupplierInput, actorRole: Role) => void
}

const COMMODITIES = [
  'Beras',
  'Gula pasir',
  'Minyak goreng',
  'Kopi robusta',
  'Telur ayam',
  'Kerajinan bambu',
  'Pupuk & saprotan',
  'Gas LPG',
]

function seedSuppliers(): Supplier[] {
  faker.seed(1515)
  return Array.from({ length: 10 }, () => {
    const type = faker.helpers.arrayElement(SUPPLIER_TYPES)
    const isLocal = type !== 'Distributor'
    const basePrice = faker.number.int({ min: 8000, max: 150_000 })
    const priceHistory: PricePoint[] = Array.from({ length: 4 }, (_, j) => ({
      date: faker.date.recent({ days: 90 - j * 20 }).toISOString(),
      price: Math.round(basePrice * (1 + faker.number.float({ min: -0.06, max: 0.08 }))),
    })).sort((a, b) => a.date.localeCompare(b.date))
    return {
      id: genId('sup'),
      name: isLocal
        ? `${faker.person.fullName()} (${faker.location.street()})`
        : faker.company.name(),
      contactPhone: `08${faker.string.numeric(10)}`,
      commodity: faker.helpers.arrayElement(COMMODITIES),
      type,
      priceHistory,
      onTimePct: faker.number.int({ min: 62, max: 100 }),
      qualityScore: faker.number.int({ min: 3, max: 5 }),
      priceConsistencyScore: faker.number.int({ min: 2, max: 5 }),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    }
  })
}

export const useSuppliersStore = create<SuppliersState>()(
  persist(
    (set) => ({
      suppliers: seedSuppliers(),
      addSupplier: (input, actorRole) => {
        const supplier: Supplier = {
          name: input.name,
          contactPhone: input.contactPhone,
          commodity: input.commodity,
          type: input.type,
          id: genId('sup'),
          priceHistory: input.initialPrice
            ? [{ date: new Date().toISOString(), price: input.initialPrice }]
            : [],
          onTimePct: 100,
          qualityScore: 0,
          priceConsistencyScore: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ suppliers: [supplier, ...state.suppliers] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Logistik',
          action: 'Mendaftarkan mitra supplier baru',
          module: 'logistik',
          targetId: supplier.id,
          detail: `${supplier.name} — ${supplier.commodity}`,
        })
      },
    }),
    { name: 'sicerah-suppliers-store' }
  )
)
