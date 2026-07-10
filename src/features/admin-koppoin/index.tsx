import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoleAccess } from '@/hooks/use-role-access'
import { CatalogCard } from './components/catalog-card'
import { RatesForm } from './components/rates-form'

export function AdminKopPoin() {
  const { activeRole, hasAccess } = useRoleAccess(['admin'])

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
            Konfigurasi KopPoin
          </h2>
          <p className='text-muted-foreground'>
            Atur rate konversi poin per aktivitas dan katalog penukaran reward.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          <RatesForm disabled={!hasAccess} />
          <CatalogCard disabled={!hasAccess} />
        </div>
      </Main>
    </>
  )
}
