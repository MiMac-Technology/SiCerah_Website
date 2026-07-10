import { useMemo } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useCashInStore } from '@/stores/cash-in-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { useFinanceConfigStore } from '@/stores/finance-config-store'
import { CashTrendChart } from './components/cash-trend-chart'

type LedgerRow = {
  id: string
  no: string
  date: string
  description: string
  direction: 'masuk' | 'keluar'
  amount: number
  isCorrection: boolean
}

export function Ledger() {
  const { activeRole, hasAccess } = useRoleAccess([
    'bendahara',
    'ketua',
    'pengawas',
  ])
  const cashIns = useCashInStore((s) => s.cashIns)
  const expenses = useExpensesStore((s) => s.expenses)
  const initialCash = useFinanceConfigStore(
    (s) => s.config.initialCashBalance ?? 0
  )

  const { totalIn, totalOut, saldo, labaBerjalan, rows } = useMemo(() => {
    const countedExpenses = expenses.filter(
      (e) => e.status !== 'Ditolak' && e.status !== 'Menunggu Approval'
    )
    const totalIn = cashIns.reduce((s, c) => s + c.amount, 0)
    const totalOut = countedExpenses.reduce((s, e) => s + e.amount, 0)
    const rows: LedgerRow[] = [
      ...cashIns.map((c) => ({
        id: c.id,
        no: c.cashInNo,
        date: c.date,
        description: c.description,
        direction: 'masuk' as const,
        amount: c.amount,
        isCorrection: !!c.correctionOfId,
      })),
      ...countedExpenses.map((e) => ({
        id: e.id,
        no: e.expenseNo,
        date: e.date,
        description: e.description,
        direction: 'keluar' as const,
        amount: e.amount,
        isCorrection: !!e.correctionOfId,
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)
    return {
      totalIn,
      totalOut,
      saldo: initialCash + totalIn - totalOut,
      labaBerjalan: totalIn - totalOut,
      rows,
    }
  }, [cashIns, expenses, initialCash])

  const tiles = [
    { title: 'Saldo Kas Saat Ini', value: formatCurrency(saldo) },
    { title: 'Laba Berjalan (Lₜ)', value: formatCurrency(labaBerjalan) },
    { title: 'Total Kas Masuk', value: formatCurrency(totalIn) },
    { title: 'Total Kas Keluar', value: formatCurrency(totalOut) },
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
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Buku Besar (Ledger)
          </h2>
          <p className='text-muted-foreground'>
            Neraca harian, laba berjalan, dan tren kas real-time — sumber data
            grafik transparansi di aplikasi anggota.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {tiles.map((tile) => (
            <Card key={tile.title}>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {tile.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{tile.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='grid gap-6 lg:grid-cols-5'>
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Tren Saldo Kas — 30 Hari Terakhir</CardTitle>
              <CardDescription>
                Saldo kumulatif harian dari C&#8320; + kas masuk − kas keluar.
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <CashTrendChart />
            </CardContent>
          </Card>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Mutasi Terakhir</CardTitle>
              <CardDescription>
                Ledger append-only — entri koreksi tampil berdampingan dengan
                entri aslinya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className='text-end'>Mutasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className='whitespace-nowrap'>
                        {formatDate(row.date)}
                      </TableCell>
                      <TableCell>
                        <div className='flex max-w-52 flex-col'>
                          <span className='truncate'>{row.description}</span>
                          <span className='flex gap-1 text-xs text-muted-foreground'>
                            {row.no}
                            {row.isCorrection && (
                              <Badge
                                variant='secondary'
                                className='px-1 py-0 text-[10px]'
                              >
                                Koreksi
                              </Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-end whitespace-nowrap ${
                          row.direction === 'masuk' && row.amount >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-destructive'
                        }`}
                      >
                        {row.direction === 'masuk' ? '+' : '−'}
                        {formatCurrency(Math.abs(row.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
