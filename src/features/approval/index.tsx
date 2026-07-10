import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useApprovalsStore } from '@/stores/approvals-store'
import { ApprovalDetailSheet } from './components/approval-detail-sheet'
import { ApprovalList } from './components/approval-list'
import { ApprovalProvider } from './components/approval-provider'

export function Approval() {
  const { activeRole, hasAccess } = useRoleAccess([
    'bendahara',
    'sekretaris',
    'ketua',
  ])
  const approvals = useApprovalsStore((s) => s.approvals)

  return (
    <ApprovalProvider>
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
            Approval Center
          </h2>
          <p className='text-muted-foreground'>
            Pengeluaran besar menunggu persetujuan bendahara, sekretaris, dan
            ketua sebelum dieksekusi.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <ApprovalList data={approvals} />
      </Main>
      <ApprovalDetailSheet />
    </ApprovalProvider>
  )
}
