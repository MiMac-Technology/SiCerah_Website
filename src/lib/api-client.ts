import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Base URL backend Laravel (SiCerah_Backend). Set VITE_API_URL di .env
 * kalau beda dari default lokal (lihat .env.example).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

/** Origin backend tanpa suffix /api — dipakai buat akses file publik (mis. /storage/...). */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

/**
 * Backend mendukung DUA cara autentikasi sekaligus (lihat
 * App\Http\Middleware\JwtFromCookie di repo backend):
 * 1. httpOnly cookie `access_token` — otomatis terkirim browser lewat
 *    `withCredentials: true`, tidak bisa dibaca JS (aman dari XSS).
 * 2. Header `Authorization: Bearer <token>` — fallback manual, dipasang
 *    di sini dari accessToken yang tersimpan di useAuthStore, untuk
 *    jaga-jaga kalau cookie cross-origin diblokir browser/environment tertentu.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * PHP tidak mem-parsing body sebagai form fields untuk request method PATCH/PUT
 * asli ber-Content-Type multipart/form-data (cuma POST yang di-parse) — jadi
 * upload file lewat PATCH butuh method-spoofing Laravel: kirim POST sungguhan
 * dengan field `_method` di body, bukan `apiClient.patch()` langsung.
 */
export function patchForm<T>(url: string, form: FormData) {
  form.append('_method', 'PATCH')
  return apiClient.post<T>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Bentuk respons standar backend: { message: string, data?: T }.
 * Lihat storage/api-docs/api-docs.json (schema MessageDataResponse) di repo backend.
 */
export interface ApiEnvelope<T> {
  message: string
  data: T
}

/**
 * Laravel paginator (dipakai di endpoint index/list yang paginated),
 * dibungkus di dalam ApiEnvelope['data'].
 */
export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
