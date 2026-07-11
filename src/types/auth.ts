/**
 * Bentuk User persis dari backend Laravel (App\Models\User / OpenAPI schema
 * "User" di storage/api-docs/api-docs.json repo SiCerah_Backend).
 */
export type UserRole =
  | 'admin'
  | 'ketua'
  | 'kasir'
  | 'bendahara'
  | 'logistik'
  | 'sekretaris'
  | 'pengawas'
  | 'anggota'

export interface AuthUser {
  id: number
  name: string
  email: string
  nik: string
  alamat: string
  no_wa: string
  role: UserRole
  no_anggota: string | null
  status_keanggotaan: 'aktif' | 'pasif' | 'keluar'
  is_active: boolean
  tanggal_lahir: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  message: string
  user: AuthUser
  token: string
  token_type: string
  expires_in: number
}
