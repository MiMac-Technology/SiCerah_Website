import { apiClient, type ApiEnvelope } from '@/lib/api-client'

export interface ShuParameter {
  id: number
  fiscal_year_id: number
  pct_jasa_modal: string
  pct_jasa_usaha: string
  pct_dana_cadangan: string
  pct_porsi_anggota: string
  pct_jasa_pengurus: string
  pct_dana_lain: string
  is_locked: boolean
  locked_at: string | null
}

export interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  status: 'open' | 'closed'
  closed_at: string | null
  shu_parameter: ShuParameter | null
}

export interface FiscalYearInput {
  name: string
  start_date: string
  end_date: string
}

export interface ShuParameterInput {
  pct_jasa_modal: number
  pct_jasa_usaha: number
  pct_dana_cadangan: number
  pct_porsi_anggota: number
  pct_jasa_pengurus: number
  pct_dana_lain: number
}

export async function listFiscalYears(): Promise<FiscalYear[]> {
  const { data } = await apiClient.get<ApiEnvelope<FiscalYear[]>>('/admin/tahun-buku')
  return data.data
}

export async function createFiscalYear(input: FiscalYearInput): Promise<FiscalYear> {
  const { data } = await apiClient.post<ApiEnvelope<FiscalYear>>('/admin/tahun-buku', input)
  return data.data
}

export async function closeFiscalYear(id: number): Promise<FiscalYear> {
  const { data } = await apiClient.post<ApiEnvelope<FiscalYear>>(
    `/admin/tahun-buku/${id}/close`
  )
  return data.data
}

export async function getShuParameter(fiscalYearId: number): Promise<ShuParameter | null> {
  const { data } = await apiClient.get<ApiEnvelope<ShuParameter | null>>(
    `/admin/parameter-shu/${fiscalYearId}`
  )
  return data.data
}

export async function updateShuParameter(
  fiscalYearId: number,
  input: ShuParameterInput
): Promise<ShuParameter> {
  const { data } = await apiClient.patch<ApiEnvelope<ShuParameter>>(
    `/admin/parameter-shu/${fiscalYearId}`,
    input
  )
  return data.data
}

export async function lockShuParameter(fiscalYearId: number): Promise<ShuParameter> {
  const { data } = await apiClient.post<ApiEnvelope<ShuParameter>>(
    `/admin/parameter-shu/${fiscalYearId}/lock`
  )
  return data.data
}
