import {
  apiClient,
  API_ORIGIN,
  type ApiEnvelope,
  type Paginated,
} from '@/lib/api-client'
import { dataUrlToFile } from '@/lib/data-url'

interface ApiProduct {
  id: number
  sku: string | null
  name: string
  unit: string
  price: string
  member_price: string | null
  cost_price: string | null
  stock: number
  min_stock: number
  is_active: boolean
}

export type Product = {
  id: number
  sku: string | null
  name: string
  unit: string
  price: number
  memberPrice: number | null
  costPrice: number | null
  stock: number
  minStock: number
  isActive: boolean
}

function mapProductFromApi(p: ApiProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    unit: p.unit,
    price: Number(p.price),
    memberPrice: p.member_price !== null ? Number(p.member_price) : null,
    costPrice: p.cost_price !== null ? Number(p.cost_price) : null,
    stock: p.stock,
    minStock: p.min_stock,
    isActive: p.is_active,
  }
}

export async function listProducts(params?: {
  search?: string
  isActive?: boolean
}): Promise<Product[]> {
  const { data } = await apiClient.get<ApiEnvelope<Paginated<ApiProduct>>>(
    '/logistik/produk',
    {
      params: {
        search: params?.search,
        is_active: params?.isActive,
        per_page: 100,
      },
    }
  )
  return data.data.data.map(mapProductFromApi)
}

export async function lowStockProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ApiEnvelope<ApiProduct[]>>(
    '/logistik/stok-opname/alert'
  )
  return data.data.map(mapProductFromApi)
}

export type ProductInput = {
  sku?: string
  name: string
  unit?: string
  price: number
  memberPrice?: number
  costPrice?: number
  minStock?: number
  isActive?: boolean
}

function toProductPayload(input: Partial<ProductInput>) {
  return {
    sku: input.sku || null,
    name: input.name,
    unit: input.unit,
    price: input.price,
    member_price: input.memberPrice ?? null,
    cost_price: input.costPrice ?? null,
    min_stock: input.minStock,
    is_active: input.isActive,
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<ApiEnvelope<ApiProduct>>(
    '/logistik/produk',
    toProductPayload(input)
  )
  return mapProductFromApi(data.data)
}

export async function updateProduct(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  const { data } = await apiClient.put<ApiEnvelope<ApiProduct>>(
    `/logistik/produk/${id}`,
    toProductPayload(input)
  )
  return mapProductFromApi(data.data)
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/logistik/produk/${id}`)
}

interface ApiStockReceiptItem {
  id: number
  product_id: number
  qty: number
  unit_cost: string | null
  product?: ApiProduct
}

interface ApiStockReceipt {
  id: number
  supplier_id: number
  surat_jalan_path: string | null
  received_at: string
  notes: string | null
  items: ApiStockReceiptItem[]
  supplier?: { id: number; name: string }
}

export type StockReceiptEntry = {
  id: string
  receiptNo: string
  date: string
  supplierName: string
  productName: string
  qty: number
  suratJalanUrl: string | null
}

function flattenStockReceipts(receipts: ApiStockReceipt[]): StockReceiptEntry[] {
  return receipts.flatMap((r) =>
    r.items.map((item) => ({
      id: `${r.id}-${item.id}`,
      receiptNo: `BM-${String(r.id).padStart(4, '0')}`,
      date: r.received_at,
      supplierName: r.supplier?.name ?? '',
      productName: item.product?.name ?? '',
      qty: item.qty,
      suratJalanUrl: r.surat_jalan_path
        ? `${API_ORIGIN}/storage/${r.surat_jalan_path}`
        : null,
    }))
  )
}

export async function listStockReceipts(): Promise<StockReceiptEntry[]> {
  const { data } = await apiClient.get<ApiEnvelope<Paginated<ApiStockReceipt>>>(
    '/logistik/barang-masuk',
    { params: { per_page: 50 } }
  )
  return flattenStockReceipts(data.data.data)
}

export type CreateStockReceiptInput = {
  supplierId: number
  productId: number
  qty: number
  unitCost?: number
  suratJalanDataUrl: string
  notes?: string
}

export async function createStockReceipt(
  input: CreateStockReceiptInput
): Promise<StockReceiptEntry[]> {
  const form = new FormData()
  form.append('supplier_id', String(input.supplierId))
  form.append(
    'surat_jalan',
    await dataUrlToFile(input.suratJalanDataUrl, 'surat-jalan.png')
  )
  if (input.notes) form.append('notes', input.notes)
  form.append('items[0][product_id]', String(input.productId))
  form.append('items[0][qty]', String(input.qty))
  if (input.unitCost !== undefined) {
    form.append('items[0][unit_cost]', String(input.unitCost))
  }

  const { data } = await apiClient.post<ApiEnvelope<ApiStockReceipt>>(
    '/logistik/barang-masuk',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return flattenStockReceipts([data.data])
}

interface ApiStockOpnameItem {
  id: number
  product_id: number
  system_qty: number
  physical_qty: number
  difference: number
  product?: ApiProduct
}

interface ApiStockOpname {
  id: number
  opname_date: string
  notes: string | null
  items: ApiStockOpnameItem[]
}

export type OpnameEntry = {
  id: string
  date: string
  productId: number
  productName: string
  systemCount: number
  physicalCount: number
  difference: number
}

function flattenOpnames(opnames: ApiStockOpname[]): OpnameEntry[] {
  return opnames.flatMap((o) =>
    o.items.map((item) => ({
      id: `${o.id}-${item.id}`,
      date: o.opname_date,
      productId: item.product_id,
      productName: item.product?.name ?? '',
      systemCount: item.system_qty,
      physicalCount: item.physical_qty,
      difference: item.difference,
    }))
  )
}

export async function listStockOpnames(): Promise<OpnameEntry[]> {
  const { data } = await apiClient.get<ApiEnvelope<Paginated<ApiStockOpname>>>(
    '/logistik/stok-opname',
    { params: { per_page: 50 } }
  )
  return flattenOpnames(data.data.data)
}

export type CreateOpnameInput = {
  productId: number
  physicalQty: number
  notes?: string
}

export async function createOpname(
  input: CreateOpnameInput
): Promise<OpnameEntry[]> {
  const { data } = await apiClient.post<ApiEnvelope<ApiStockOpname>>(
    '/logistik/stok-opname',
    {
      opname_date: new Date().toISOString().slice(0, 10),
      notes: input.notes,
      items: [{ product_id: input.productId, physical_qty: input.physicalQty }],
    }
  )
  return flattenOpnames([data.data])
}
