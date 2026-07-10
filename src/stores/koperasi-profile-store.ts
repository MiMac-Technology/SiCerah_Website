import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuditStore } from '@/stores/audit-store'

export type KoperasiProfile = {
  name: string
  villageAddress: string
  legalNumber: string
  logoDataUrl?: string
  /** Nomor WhatsApp bot Fonnte untuk kanal verifikasi/struk. */
  fonnteNumber: string
  updatedAt: string
}

type KoperasiProfileState = {
  profile: KoperasiProfile
  updateProfile: (partial: Partial<Omit<KoperasiProfile, 'updatedAt'>>) => void
}

const DEFAULT_PROFILE: KoperasiProfile = {
  name: 'Koperasi Sejahtera',
  villageAddress: 'Desa Sukamaju, Kec. Cikarang Utara',
  legalNumber: 'AHU-0001234.AH.01.26.TAHUN 2024',
  logoDataUrl: undefined,
  fonnteNumber: '',
  updatedAt: new Date().toISOString(),
}

export const useKoperasiProfileStore = create<KoperasiProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (partial) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: 'Memperbarui profil koperasi',
          module: 'admin',
        })
      },
    }),
    { name: 'sicerah-koperasi-profile-store' }
  )
)
