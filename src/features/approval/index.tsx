import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DelegationCard } from '@/components/delegation-card'
import { OverdueApprovalsBanner } from '@/components/overdue-approvals-banner'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useApprovalsStore } from '@/stores/approvals-store'
import { isDelegateFor, useDelegationStore } from '@/stores/delegation-store'
import { ApprovalDetailSheet } from './components/approval-detail-sheet'
import { ApprovalList } from './components/approval-list'
import { ApprovalProvider } from './components/approval-provider'

export function Approval() {
  const { activeRole, hasAccess: baseAccess } = useRoleAccess([
    'bendahara',
    'sekretaris',
    'ketua',
  ])
  const approvals = useApprovalsStore((s) => s.approvals)
  const delegation = useDelegationStore((s) => s.delegation)
  const holdsDelegation = isDelegateFor(delegation, activeRole, 'pengeluaran')
  const hasAccess = baseAccess || holdsDelegation
  const isKetua = activeRole === 'ketua'

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
        {(isKetua || holdsDelegation) && <OverdueApprovalsBanner />}
        <div className='space-y-6'>
          {isKetua && <DelegationCard />}
          <ApprovalList data={approvals} />
        </div>
      </Main>
      <ApprovalDetailSheet />
    </ApprovalProvider>
  )
}
