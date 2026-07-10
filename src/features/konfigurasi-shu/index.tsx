import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useShuConfigStore } from '@/stores/shu-config-store'
import { ParameterLockCard } from './components/parameter-lock-card'
import { ShuConfigForm } from './components/shu-config-form'

export function KonfigurasiShu() {
  const { activeRole, hasAccess } = useRoleAccess(['bendahara', 'ketua'])
  const locked = useShuConfigStore((s) => s.config.locked ?? false)

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Konfigurasi Parameter SHU
          </h2>
          <p className='text-muted-foreground'>
            Sesuaikan parameter SHU dan AD/ART mengikuti aturan koperasi ini.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          <ParameterLockCard isKetua={activeRole === 'ketua'} />
          <ShuConfigForm disabled={!hasAccess || locked} />
        </div>
      </Main>
    </>
  )
}
