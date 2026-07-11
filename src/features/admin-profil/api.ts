import { apiClient, API_ORIGIN, patchForm, type ApiEnvelope } from '@/lib/api-client'
import { dataUrlToFile, isDataUrl } from '@/lib/data-url'

/**
 * Pengaturan Aplikasi Koperasi (backend: App\Models\CooperativeProfile,
 * tabel cooperative_profiles) — TERPISAH dari data registrasi feeder
 * SIMKOPDES (App\Models\ProfilKoperasi). Lihat backend
 * app/Http/Controllers/Api/Admin/CooperativeProfileController.php.
 */
export interface CooperativeProfile {
  id: number
  nama: string
  alamat: string
  nomor_badan_hukum: string | null
  logo_path: string | null
  logo_url: string | null
  wa_bot_number: string | null
  announcement_threshold: string
  member_approval_threshold: string
  approval_quorum_pct: string
  initial_cash_balance: string
  updated_at: string
}

export interface CooperativeProfileInput {
  nama: string
  alamat: string
  nomorBadanHukum?: string
  logoDataUrl?: string
  waBotNumber?: string
  announcementThreshold: number
  memberApprovalThreshold: number
  approvalQuorumPct: number
  initialCashBalance: number
}

export async function getCooperativeProfile(): Promise<CooperativeProfile | null> {
  const { data } = await apiClient.get<ApiEnvelope<CooperativeProfile | null>>(
    '/admin/pengaturan-koperasi'
  )
  return data.data
}

export async function updateCooperativeProfile(
  input: CooperativeProfileInput
): Promise<CooperativeProfile> {
  const form = new FormData()
  form.append('nama', input.nama)
  form.append('alamat', input.alamat)
  if (input.nomorBadanHukum) form.append('nomor_badan_hukum', input.nomorBadanHukum)
  if (input.waBotNumber) form.append('wa_bot_number', input.waBotNumber)
  form.append('announcement_threshold', String(input.announcementThreshold))
  form.append('member_approval_threshold', String(input.memberApprovalThreshold))
  form.append('approval_quorum_pct', String(input.approvalQuorumPct))
  form.append('initial_cash_balance', String(input.initialCashBalance))

  if (isDataUrl(input.logoDataUrl)) {
    form.append('logo', await dataUrlToFile(input.logoDataUrl, 'logo.png'))
  }

  const { data } = await patchForm<ApiEnvelope<CooperativeProfile>>(
    '/admin/pengaturan-koperasi',
    form
  )
  return data.data
}

export function resolveLogoUrl(profile: CooperativeProfile | null): string | undefined {
  if (!profile) return undefined
  if (profile.logo_url) return profile.logo_url
  if (profile.logo_path) return `${API_ORIGIN}/storage/${profile.logo_path}`
  return undefined
}
