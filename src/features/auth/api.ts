import { apiClient } from '@/lib/api-client'
import type { AuthUser } from '@/types/auth'

/**
 * GET /user balikin User mentah (tidak dibungkus {message,data}) — lihat
 * AuthController::me() di repo backend. Dipakai buat rehydrate sesi setelah
 * hard refresh, karena token httpOnly cookie tidak bisa dibaca dari JS —
 * satu-satunya cara tahu sesi masih valid ya dengan nanya ke server.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/user')
  return data
}
