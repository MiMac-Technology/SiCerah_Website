import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { ROLE_LABELS, ROLES, type Role } from '@/config/roles'

export type AuditModule =
  | 'pos'
  | 'pengumuman'
  | 'anggota'
  | 'kas-keluar'
  | 'approval'
  | 'shu-config'
  | 'admin'
  | 'logistik'

export type AuditEntry = {
  id: string
  timestamp: string
  activeRole: Role
  actorLabel: string
  action: string
  module: AuditModule
  targetId?: string
  detail?: string
  /** Perangkat/asal aksi (untuk audit level aplikasi). */
  device?: string
}

type AuditState = {
  entries: AuditEntry[]
  logAction: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
}

const MODULES: AuditModule[] = [
  'pos',
  'pengumuman',
  'anggota',
  'kas-keluar',
  'approval',
  'shu-config',
]

const SAMPLE_ACTIONS: Record<AuditModule, string[]> = {
  pos: ['Mencatat transaksi penjualan', 'Mengirim struk via WhatsApp'],
  pengumuman: ['Membuat pengumuman', 'Mempublikasikan pengumuman'],
  anggota: ['Meregistrasi anggota baru', 'Mengubah status keanggotaan'],
  'kas-keluar': ['Mencatat pengeluaran kas', 'Memverifikasi pengeluaran kas'],
  approval: ['Memberikan suara persetujuan', 'Memfinalisasi approval'],
  'shu-config': ['Memperbarui parameter SHU/AD-ART'],
  admin: ['Membuat akun pengurus', 'Memperbarui profil koperasi'],
  logistik: ['Mencatat barang masuk', 'Melakukan stok opname'],
}

function detectDevice(): string {
  if (typeof navigator === 'undefined') return 'Web'
  const ua = navigator.userAgent
  const browser = ua.includes('Edg')
    ? 'Edge'
    : ua.includes('Chrome')
      ? 'Chrome'
      : ua.includes('Safari')
        ? 'Safari'
        : 'Browser'
  const os = ua.includes('Windows')
    ? 'Windows'
    : ua.includes('Android')
      ? 'Android'
      : ua.includes('Mac')
        ? 'macOS'
        : 'OS lain'
  return `Web — ${browser} (${os})`
}

function seedEntries(): AuditEntry[] {
  faker.seed(1001)
  return Array.from({ length: 40 }, () => {
    const mod = faker.helpers.arrayElement(MODULES)
    const role = faker.helpers.arrayElement(ROLES)
    return {
      id: genId('audit'),
      timestamp: faker.date.recent({ days: 60 }).toISOString(),
      activeRole: role,
      actorLabel: `${ROLE_LABELS[role]} ${faker.person.firstName()}`,
      action: faker.helpers.arrayElement(SAMPLE_ACTIONS[mod]),
      module: mod,
      detail: faker.lorem.sentence({ min: 4, max: 8 }),
      device: faker.helpers.arrayElement([
        'Web — Chrome (Windows)',
        'Web — Chrome (Android)',
        'Web — Safari (iPhone)',
        'Web — Edge (Windows)',
      ]),
    }
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      entries: seedEntries(),
      logAction: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: genId('audit'),
              timestamp: new Date().toISOString(),
              device: entry.device ?? detectDevice(),
            },
            ...state.entries,
          ],
        })),
    }),
    { name: 'sicerah-audit-store' }
  )
)
