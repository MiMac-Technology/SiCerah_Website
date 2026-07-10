import {
  LayoutDashboard,
  ShoppingCart,
  Megaphone,
  Users,
  Wallet,
  Vote,
  SlidersHorizontal,
  ShieldCheck,
  Settings,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
  Building2,
  KeyRound,
  Coins,
  Banknote,
  CalendarClock,
  Gift,
  PiggyBank,
  BookOpenText,
  FileBarChart2,
  HandCoins,
  Boxes,
  Truck,
  Handshake,
  FolderArchive,
  Eye,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Pengurus SiCerah',
    email: 'pengurus@sicerah.koperasi.id',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Koperasi Sejahtera',
      logo: Building2,
      plan: 'SiCerah',
    },
  ],
  navGroups: [
    {
      title: 'Utama',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Administrator',
      items: [
        {
          title: 'Akun Pengurus',
          url: '/admin/akun',
          icon: KeyRound,
          roles: ['admin'],
        },
        {
          title: 'Profil Koperasi',
          url: '/admin/profil',
          icon: Building2,
          roles: ['admin'],
        },
        {
          title: 'Konfigurasi KopPoin',
          url: '/admin/koppoin',
          icon: Coins,
          roles: ['admin'],
        },
        {
          title: 'Pengaturan Keuangan',
          url: '/admin/keuangan',
          icon: Banknote,
          roles: ['admin'],
        },
      ],
    },
    {
      title: 'Kasir',
      items: [
        {
          title: 'POS',
          url: '/pos',
          icon: ShoppingCart,
          roles: ['kasir', 'ketua', 'bendahara'],
        },
        {
          title: 'Tutup Kas Harian',
          url: '/tutup-kas',
          icon: CalendarClock,
          roles: ['kasir', 'bendahara', 'ketua'],
        },
        {
          title: 'Penukaran KopPoin',
          url: '/penukaran-poin',
          icon: Gift,
          roles: ['kasir', 'bendahara', 'ketua'],
        },
      ],
    },
    {
      title: 'Logistik',
      items: [
        {
          title: 'Manajemen Stok',
          url: '/stok',
          icon: Boxes,
          roles: ['logistik', 'ketua'],
        },
        {
          title: 'Mitra Supplier',
          url: '/supplier',
          icon: Truck,
          roles: ['logistik', 'ketua'],
        },
        {
          title: 'Forward Contract',
          url: '/kontrak',
          icon: Handshake,
          roles: ['logistik', 'ketua'],
        },
      ],
    },
    {
      title: 'Sekretariat',
      items: [
        {
          title: 'Pengumuman',
          url: '/pengumuman',
          icon: Megaphone,
          roles: ['sekretaris', 'ketua'],
        },
        {
          title: 'Anggota',
          url: '/anggota',
          icon: Users,
          roles: ['sekretaris', 'ketua'],
        },
        {
          title: 'Rapat',
          url: '/rapat',
          icon: CalendarClock,
          roles: ['sekretaris', 'ketua'],
        },
        {
          title: 'Dokumen Koperasi',
          url: '/dokumen',
          icon: FolderArchive,
          roles: ['sekretaris', 'ketua', 'pengawas'],
        },
      ],
    },
    {
      title: 'Keuangan',
      items: [
        {
          title: 'Kas Masuk',
          url: '/kas-masuk',
          icon: PiggyBank,
          roles: ['bendahara', 'ketua'],
        },
        {
          title: 'Kas Keluar',
          url: '/kas-keluar',
          icon: Wallet,
          roles: ['bendahara', 'ketua'],
        },
        {
          title: 'Buku Besar',
          url: '/ledger',
          icon: BookOpenText,
          roles: ['bendahara', 'ketua', 'pengawas'],
        },
        {
          title: 'Laporan Keuangan',
          url: '/laporan',
          icon: FileBarChart2,
          roles: ['bendahara', 'ketua', 'pengawas'],
        },
        {
          title: 'Simpan Pinjam',
          url: '/simpan-pinjam',
          icon: HandCoins,
          roles: ['bendahara', 'ketua'],
        },
        {
          title: 'Approval Center',
          url: '/approval',
          icon: Vote,
          roles: ['bendahara', 'sekretaris', 'ketua'],
        },
        {
          title: 'Konfigurasi SHU',
          url: '/konfigurasi-shu',
          icon: SlidersHorizontal,
          roles: ['bendahara', 'ketua'],
        },
      ],
    },
    {
      title: 'Pengawasan',
      items: [
        {
          title: 'Pengawasan',
          url: '/pengawasan',
          icon: Eye,
          roles: ['pengawas', 'ketua'],
        },
        {
          title: 'Audit Trail',
          url: '/audit',
          icon: ShieldCheck,
          roles: ['pengawas', 'ketua', 'bendahara'],
        },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
