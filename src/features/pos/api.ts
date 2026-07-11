import { apiClient, patchForm, type ApiEnvelope, type Paginated } from '@/lib/api-client'
import { dataUrlToFile } from '@/lib/data-url'

export type BuyerType = 'anggota' | 'non-anggota' | 'tanpa-ponsel'
export type VoidStatus = 'Diminta' | 'Disetujui'

interface ApiProduct {
  id: number
  sku: string | null
  name: string
  unit: string
  price: string
  member_price: string | null
  stock: number
  is_active: boolean
}

export type Product = {
  id: number
  sku: string | null
  name: string
  unit: string
  price: number
  memberPrice: number | null
  stock: number
}

function mapProductFromApi(p: ApiProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    unit: p.unit,
    price: Number(p.price),
    memberPrice: p.member_price !== null ? Number(p.member_price) : null,
    stock: p.stock,
  }
}

export async function listProducts(q?: string): Promise<Product[]> {
  const { data } = await apiClient.get<ApiEnvelope<Paginated<ApiProduct>>>(
    '/kasir/produk',
    { params: { q, per_page: 50 } }
  )
  return data.data.data.map(mapProductFromApi)
}

interface ApiMemberLookup {
  id: number
  name: string
  no_anggota: string | null
  no_wa: string | null
}

export type MemberLookup = {
  id: number
  name: string
  memberNo: string | null
  phone: string | null
}

function mapMemberFromApi(m: ApiMemberLookup): MemberLookup {
  return { id: m.id, name: m.name, memberNo: m.no_anggota, phone: m.no_wa }
}

export async function searchMembers(q: string): Promise<MemberLookup[]> {
  const { data } = await apiClient.get<ApiEnvelope<ApiMemberLookup[]>>(
    '/kasir/anggota/cari',
    { params: { q } }
  )
  return data.data.map(mapMemberFromApi)
}

interface ApiSaleItem {
  id: number
  product_id: number
  qty: number
  unit_price: string
  regular_unit_price: string
  subtotal: string
  product?: ApiProduct
}

interface ApiSale {
  id: number
  invoice_number: string
  member_id: number | null
  buyer_name: string | null
  buyer_type: BuyerType
  customer_wa: string | null
  total: string
  member_savings: string
  kontribusi_u: string | null
  status: 'selesai' | 'menunggu_void' | 'void'
  void_reason: string | null
  signature_path: string | null
  signature_url?: string
  points_earned?: number
  created_at: string
  items: ApiSaleItem[]
  member?: { id: number; name: string; no_wa?: string | null } | null
}

export type SaleItem = {
  productId: number
  name: string
  qty: number
  unitPriceMember: number
  unitPriceNonMember: number
}

export type Sale = {
  id: number
  trxNo: string
  timestamp: string
  buyerType: BuyerType
  buyerName?: string
  memberId?: number
  memberName?: string
  memberPhone?: string
  buyerPhone?: string
  items: SaleItem[]
  totalMember: number
  totalNonMember: number
  totalCharged: number
  kontribusiU?: number
  kopPoinEarned?: number
  signatureUrl?: string
  voidStatus?: VoidStatus
  voidReason?: string
}

function mapSaleFromApi(s: ApiSale): Sale {
  const items: SaleItem[] = s.items.map((item) => ({
    productId: item.product_id,
    name: item.product?.name ?? '',
    qty: item.qty,
    unitPriceMember: Number(item.product?.member_price ?? item.unit_price),
    unitPriceNonMember: Number(item.regular_unit_price),
  }))

  return {
    id: s.id,
    trxNo: s.invoice_number,
    timestamp: s.created_at,
    buyerType: s.buyer_type,
    buyerName: s.buyer_name ?? undefined,
    memberId: s.member_id ?? undefined,
    memberName: s.member?.name,
    memberPhone: s.member?.no_wa ?? undefined,
    buyerPhone: s.customer_wa ?? undefined,
    items,
    totalMember: items.reduce((sum, i) => sum + i.qty * i.unitPriceMember, 0),
    totalNonMember: items.reduce(
      (sum, i) => sum + i.qty * i.unitPriceNonMember,
      0
    ),
    totalCharged: Number(s.total),
    kontribusiU: s.kontribusi_u ? Number(s.kontribusi_u) : undefined,
    kopPoinEarned: s.points_earned,
    signatureUrl: s.signature_url ?? undefined,
    voidStatus:
      s.status === 'menunggu_void'
        ? 'Diminta'
        : s.status === 'void'
          ? 'Disetujui'
          : undefined,
    voidReason: s.void_reason ?? undefined,
  }
}

export async function listSales(params?: {
  tanggal?: string
  per_page?: number
}): Promise<Sale[]> {
  const { data } = await apiClient.get<ApiEnvelope<Paginated<ApiSale>>>(
    '/kasir/penjualan',
    { params: { per_page: 100, ...params } }
  )
  return data.data.data.map(mapSaleFromApi)
}

/** Bendahara tidak punya akses ke seluruh riwayat penjualan (itu domain kasir) —
 * hanya melihat antrean transaksi yang menunggu approval void. */
export async function listPendingVoidSales(): Promise<Sale[]> {
  const { data } = await apiClient.get<ApiEnvelope<ApiSale[]>>(
    '/bendahara/void-penjualan'
  )
  return data.data.map(mapSaleFromApi)
}

export type CreateSaleInput = {
  items: { productId: number; qty: number }[]
  buyerType: BuyerType
  buyerName?: string
  memberId?: number
  customerWa?: string
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { data } = await apiClient.post<ApiEnvelope<ApiSale>>(
    '/kasir/penjualan',
    {
      items: input.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
      buyer_type: input.buyerType,
      buyer_name: input.buyerName,
      member_id: input.memberId,
      customer_wa: input.customerWa,
    }
  )
  return mapSaleFromApi(data.data)
}

export async function requestVoidSale(
  saleId: number,
  reason: string
): Promise<Sale> {
  const { data } = await apiClient.patch<ApiEnvelope<ApiSale>>(
    `/kasir/penjualan/${saleId}/void`,
    { reason }
  )
  return mapSaleFromApi(data.data)
}

export async function signSale(
  saleId: number,
  signatureDataUrl: string
): Promise<Sale> {
  const form = new FormData()
  form.append('signature', await dataUrlToFile(signatureDataUrl, 'ttd.png'))

  const { data } = await patchForm<ApiEnvelope<ApiSale>>(
    `/kasir/penjualan/${saleId}/tanda-tangan`,
    form
  )
  return mapSaleFromApi(data.data)
}

export async function approveVoidSale(saleId: number): Promise<Sale> {
  const { data } = await apiClient.post<ApiEnvelope<ApiSale>>(
    `/bendahara/void-penjualan/${saleId}/approve`
  )
  return mapSaleFromApi(data.data)
}

export async function rejectVoidSale(saleId: number): Promise<Sale> {
  const { data } = await apiClient.post<ApiEnvelope<ApiSale>>(
    `/bendahara/void-penjualan/${saleId}/reject`
  )
  return mapSaleFromApi(data.data)
}
