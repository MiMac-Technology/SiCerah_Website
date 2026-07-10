import { useMembersStore } from '@/stores/members-store'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoleAccess } from '@/hooks/use-role-access'
import { AnggotaDialogs } from './components/anggota-dialogs'
import { AnggotaPrimaryButtons } from './components/anggota-primary-buttons'
import { AnggotaProvider } from './components/anggota-provider'
import { AnggotaTable } from './components/anggota-table'

export function Anggota() {
  const { activeRole, hasAccess } = useRoleAccess(['sekretaris', 'ketua'])
  const members = useMembersStore((s) => s.members)

  return (
    <AnggotaProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Anggota</h2>
            <p className='text-muted-foreground'>
              Registrasi dan kelola data keanggotaan koperasi.
            </p>
          </div>
          <AnggotaPrimaryButtons disabled={!hasAccess} />
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <AnggotaTable data={members} disabled={!hasAccess} />
        </div>
      </Main>

      <AnggotaDialogs />
    </AnggotaProvider>
  )
}
