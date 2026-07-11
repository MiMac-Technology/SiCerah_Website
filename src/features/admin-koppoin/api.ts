import { apiClient, type ApiEnvelope } from '@/lib/api-client'

export type PointActivity =
  | 'belanja'
  | 'simpanan'
  | 'setor_panen'
  | 'bayar_cicilan'
  | 'hadir_rapat'

export interface PointRule {
  id: number
  activity: PointActivity
  points: number
  per_amount: string | null
  description: string | null
  is_active: boolean
}

export interface PointRuleUpdateInput {
  points: number
  per_amount?: number | null
  description?: string
  is_active?: boolean
}

export interface PointCatalogItem {
  id: number
  name: string
  description: string | null
  cost_points: number
  quota: number | null
  valid_until: string | null
  is_active: boolean
}

export interface PointCatalogItemInput {
  name: string
  description?: string
  cost_points: number
  quota?: number | null
  valid_until?: string | null
  is_active?: boolean
}

export async function listPointRules(): Promise<PointRule[]> {
  const { data } = await apiClient.get<ApiEnvelope<PointRule[]>>('/admin/poin/rules')
  return data.data
}

export async function updatePointRule(
  id: number,
  input: PointRuleUpdateInput
): Promise<PointRule> {
  const { data } = await apiClient.patch<ApiEnvelope<PointRule>>(
    `/admin/poin/rules/${id}`,
    input
  )
  return data.data
}

export async function listCatalog(): Promise<PointCatalogItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<PointCatalogItem[]>>('/admin/poin/katalog')
  return data.data
}

export async function createCatalogItem(
  input: PointCatalogItemInput
): Promise<PointCatalogItem> {
  const { data } = await apiClient.post<ApiEnvelope<PointCatalogItem>>(
    '/admin/poin/katalog',
    input
  )
  return data.data
}

export async function deleteCatalogItem(id: number): Promise<void> {
  await apiClient.delete(`/admin/poin/katalog/${id}`)
}
