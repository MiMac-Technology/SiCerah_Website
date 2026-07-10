import {
  ShieldCheck,
  Landmark,
  NotebookPen,
  ReceiptText,
  Eye,
  Settings2,
  PackageSearch,
  type LucideIcon,
} from 'lucide-react'

export type Role =
  | 'admin'
  | 'kasir'
  | 'bendahara'
  | 'logistik'
  | 'sekretaris'
  | 'ketua'
  | 'pengawas'

export const ROLES: Role[] = [
  'admin',
  'kasir',
  'bendahara',
  'logistik',
  'sekretaris',
  'ketua',
  'pengawas',
]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  kasir: 'Kasir',
  bendahara: 'Bendahara',
  logistik: 'Logistik',
  sekretaris: 'Sekretaris',
  ketua: 'Ketua',
  pengawas: 'Pengawas',
}

export const ROLE_ICONS: Record<Role, LucideIcon> = {
  admin: Settings2,
  kasir: ReceiptText,
  bendahara: Landmark,
  logistik: PackageSearch,
  sekretaris: NotebookPen,
  ketua: ShieldCheck,
  pengawas: Eye,
}

export const DEFAULT_ROLE: Role = 'admin'

/** Role akun pengurus yang dikelola Administrator (RBAC). */
export type StaffRole =
  | 'kasir'
  | 'bendahara'
  | 'logistik'
  | 'sekretaris'
  | 'pengawas'

export const STAFF_ROLES: StaffRole[] = [
  'kasir',
  'bendahara',
  'logistik',
  'sekretaris',
  'pengawas',
]

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  kasir: 'Kasir',
  bendahara: 'Bendahara',
  logistik: 'Logistik',
  sekretaris: 'Sekretaris',
  pengawas: 'Pengawas',
}
