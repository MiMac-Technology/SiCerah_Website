import { apiClient, type ApiEnvelope, type Paginated } from '@/lib/api-client'
import type { StaffRole } from '@/config/roles'

export type AccountStatus = 'aktif' | 'nonaktif'

/**
 * Bentuk baris akun pengurus di UI — dipetakan dari User backend
 * (App\Models\User, role != 'admin'/'anggota'). Lihat mapFromApi().
 */
export type StaffAccount = {
  id: number
  name: string
  email: string
  phone: string
  nik: string
  alamat: string
  role: StaffRole
  status: AccountStatus
  createdAt: string
}

export type StaffAccountCreateInput = {
  name: string
  email: string
  password: string
  nik: string
  alamat: string
  phone: string
  role: StaffRole
}

export type StaffAccountUpdateInput = Partial<StaffAccountCreateInput>

interface ApiUser {
  id: number
  name: string
  email: string
  nik: string
  alamat: string
  no_wa: string
  role: StaffRole
  is_active: boolean
  created_at: string
}

function mapFromApi(user: ApiUser): StaffAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.no_wa,
    nik: user.nik,
    alamat: user.alamat,
    role: user.role,
    status: user.is_active ? 'aktif' : 'nonaktif',
    createdAt: user.created_at,
  }
}

export async function listAccounts(): Promise<StaffAccount[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<Paginated<ApiUser>>
  >('/admin/akun-pengurus', { params: { per_page: 100 } })
  return data.data.data.map(mapFromApi)
}

export async function createAccount(
  input: StaffAccountCreateInput
): Promise<StaffAccount> {
  const { data } = await apiClient.post<ApiEnvelope<ApiUser>>(
    '/admin/akun-pengurus',
    { ...input, no_wa: input.phone }
  )
  return mapFromApi(data.data)
}

export async function updateAccount(
  id: number,
  input: StaffAccountUpdateInput
): Promise<StaffAccount> {
  const { phone, ...rest } = input
  const { data } = await apiClient.put<ApiEnvelope<ApiUser>>(
    `/admin/akun-pengurus/${id}`,
    { ...rest, ...(phone ? { no_wa: phone } : {}) }
  )
  return mapFromApi(data.data)
}

export async function setAccountStatus(
  id: number,
  status: AccountStatus
): Promise<StaffAccount> {
  const { data } = await apiClient.patch<ApiEnvelope<ApiUser>>(
    `/admin/akun-pengurus/${id}/status`,
    { is_active: status === 'aktif' }
  )
  return mapFromApi(data.data)
}
