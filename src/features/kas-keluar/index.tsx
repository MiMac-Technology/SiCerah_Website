import { useRoleAccess } from '@/hooks/use-role-access'
import { useExpensesStore } from '@/stores/expenses-store'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { KasKeluarDialogs } from './components/kas-keluar-dialogs'
import { KasKeluarPrimaryButtons } from './components/kas-keluar-primary-buttons'
import { KasKeluarProvider } from './components/kas-keluar-provider'
import { KasKeluarTable } from './components/kas-keluar-table'

export function KasKeluar() {
  const { activeRole, hasAccess } = useRoleAccess(['bendahara', 'ketua'])
  const expenses = useExpensesStore((s) => s.expenses)

  return (
    <KasKeluarProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Kas Keluar</h2>
            <p className='text-muted-foreground'>
              Catat pengeluaran koperasi dengan bukti foto wajib.
            </p>
          </div>
          <KasKeluarPrimaryButtons disabled={!hasAccess} />
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <KasKeluarTable data={expenses} disabled={!hasAccess} />
        </div>
      </Main>
      <KasKeluarDialogs />
    </KasKeluarProvider>
  )
}
