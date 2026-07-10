import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type Product = {
  id: string
  sku: string
  name: string
  unit: string
  stock: number
  /** Alert stok menipis aktif saat stock < minThreshold. */
  minThreshold: number
}

export type StockIn = {
  id: string
  stockInNo: string
  date: string
  productId: string
  productName: string
  qty: number
  supplierName: string
  /** Foto surat jalan wajib sebagai bukti penerimaan barang. */
  deliveryNotePhotoDataUrl: string
  createdAt: string
}

export type Opname = {
  id: string
  date: string
  productId: string
  productName: string
  systemCount: number
  physicalCount: number
  difference: number
  notes?: string
}

export type AddStockInInput = {
  productId: string
  qty: number
  supplierName: string
  deliveryNotePhotoDataUrl: string
}

type ProductsState = {
  products: Product[]
  stockIns: StockIn[]
  opnames: Opname[]
  addStockIn: (input: AddStockInInput, actorRole: Role) => void
  recordOpname: (
    productId: string,
    physicalCount: number,
    notes: string | undefined,
    actorRole: Role
  ) => void
}

const PRODUCT_SEED: { name: string; unit: string; minThreshold: number }[] = [
  { name: 'Beras Premium 5kg', unit: 'sak', minThreshold: 20 },
  { name: 'Gula Pasir 1kg', unit: 'pak', minThreshold: 30 },
  { name: 'Minyak Goreng 2L', unit: 'botol', minThreshold: 25 },
  { name: 'Pupuk NPK 50kg', unit: 'sak', minThreshold: 15 },
  { name: 'Telur Ayam', unit: 'kg', minThreshold: 20 },
  { name: 'Tepung Terigu 1kg', unit: 'pak', minThreshold: 20 },
  { name: 'Gas LPG 3kg', unit: 'tabung', minThreshold: 10 },
  { name: 'Kopi Bubuk Lokal 250g', unit: 'pak', minThreshold: 15 },
]

function seedProducts(): Product[] {
  faker.seed(1313)
  return PRODUCT_SEED.map((p, i) => ({
    id: genId('prd'),
    sku: `SKU-${String(i + 1).padStart(3, '0')}`,
    name: p.name,
    unit: p.unit,
    // Beberapa produk sengaja di bawah threshold agar alert terlihat di demo.
    stock:
      i % 3 === 0
        ? faker.number.int({ min: 2, max: p.minThreshold - 1 })
        : faker.number.int({ min: p.minThreshold + 10, max: 120 }),
    minThreshold: p.minThreshold,
  }))
}

function seedStockIns(products: Product[]): StockIn[] {
  faker.seed(1414)
  return Array.from({ length: 10 }, (_, i) => {
    const product = faker.helpers.arrayElement(products)
    return {
      id: genId('sin'),
      stockInNo: `BM-${String(i + 1).padStart(4, '0')}`,
      date: faker.date.recent({ days: 30 }).toISOString(),
      productId: product.id,
      productName: product.name,
      qty: faker.number.int({ min: 10, max: 60 }),
      supplierName: faker.company.name(),
      deliveryNotePhotoDataUrl: '',
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
}

const initialProducts = seedProducts()

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      stockIns: seedStockIns(initialProducts),
      opnames: [],
      addStockIn: (input, actorRole) => {
        const product = get().products.find((p) => p.id === input.productId)
        if (!product) return
        const entry: StockIn = {
          id: genId('sin'),
          stockInNo: `BM-${String(get().stockIns.length + 1).padStart(4, '0')}`,
          date: new Date().toISOString(),
          productId: product.id,
          productName: product.name,
          qty: input.qty,
          supplierName: input.supplierName,
          deliveryNotePhotoDataUrl: input.deliveryNotePhotoDataUrl,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          stockIns: [entry, ...state.stockIns],
          products: state.products.map((p) =>
            p.id === product.id ? { ...p, stock: p.stock + input.qty } : p
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Logistik',
          action: 'Mencatat barang masuk dari supplier',
          module: 'logistik',
          targetId: entry.id,
          detail: `${product.name} +${input.qty} ${product.unit} (${input.supplierName})`,
        })
      },
      recordOpname: (productId, physicalCount, notes, actorRole) => {
        const product = get().products.find((p) => p.id === productId)
        if (!product) return
        const opname: Opname = {
          id: genId('opn'),
          date: new Date().toISOString(),
          productId,
          productName: product.name,
          systemCount: product.stock,
          physicalCount,
          difference: physicalCount - product.stock,
          notes,
        }
        set((state) => ({
          opnames: [opname, ...state.opnames],
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: physicalCount } : p
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Logistik',
          action: 'Melakukan stok opname',
          module: 'logistik',
          targetId: opname.id,
          detail: `${product.name}: sistem ${opname.systemCount}, fisik ${physicalCount} (selisih ${opname.difference})`,
        })
      },
    }),
    { name: 'sicerah-products-store' }
  )
)
