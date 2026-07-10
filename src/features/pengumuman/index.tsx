import { useRoleAccess } from '@/hooks/use-role-access'
import { useAnnouncementsStore } from '@/stores/announcements-store'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PengumumanDialogs } from './components/pengumuman-dialogs'
import { PengumumanPrimaryButtons } from './components/pengumuman-primary-buttons'
import { PengumumanProvider } from './components/pengumuman-provider'
import { PengumumanTable } from './components/pengumuman-table'

export function Pengumuman() {
  const { activeRole, hasAccess } = useRoleAccess(['sekretaris', 'ketua'])
  const announcements = useAnnouncementsStore((s) => s.announcements)

  return (
    <PengumumanProvider>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pengumuman</h2>
            <p className='text-muted-foreground'>
              Kelola pengumuman yang tampil di beranda aplikasi anggota.
            </p>
          </div>
          <PengumumanPrimaryButtons disabled={!hasAccess} />
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <PengumumanTable data={announcements} disabled={!hasAccess} />
        </div>
      </Main>

      <PengumumanDialogs />
    </PengumumanProvider>
  )
}
