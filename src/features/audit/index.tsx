import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApprovalsStore } from '@/stores/approvals-store'
import { useAuditStore } from '@/stores/audit-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { useMembersStore } from '@/stores/members-store'
import { AuditTable } from './components/audit-table'

export function Audit() {
  const entries = useAuditStore((s) => s.entries)
  const approvals = useApprovalsStore((s) => s.approvals)
  const expenses = useExpensesStore((s) => s.expenses)
  const members = useMembersStore((s) => s.members)

  const stats = [
    {
      title: 'Approval Berjalan',
      value: approvals.filter((a) => a.status === 'Berjalan').length,
    },
    {
      title: 'Menunggu Verifikasi',
      value: expenses.filter((e) => e.status === 'Menunggu Verifikasi').length,
    },
    {
      title: 'Anggota Aktif',
      value: members.filter((m) => m.status === 'aktif').length,
    },
    { title: 'Total Aktivitas Tercatat', value: entries.length },
  ]

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
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Audit Trail</h2>
            <p className='text-muted-foreground'>
              Jejak aktivitas append-only — tidak dapat diubah atau dihapus
              oleh siapa pun, termasuk pengurus.
            </p>
          </div>
          <Button variant='outline' onClick={() => window.print()}>
            <FileDown className='size-4' /> Export PDF
          </Button>
        </div>
        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='print-area'>
          <AuditTable data={entries} />
        </div>
      </Main>
    </>
  )
}
