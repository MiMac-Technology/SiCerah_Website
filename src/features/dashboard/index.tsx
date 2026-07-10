import { useMemo } from 'react'
import {
  AlertTriangle,
  Banknote,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OverdueApprovalsBanner } from '@/components/overdue-approvals-banner'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRole } from '@/context/role-provider'
import { useCashInStore } from '@/stores/cash-in-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { useFinanceConfigStore } from '@/stores/finance-config-store'
import { useLoansStore } from '@/stores/loans-store'
import { useMembersStore } from '@/stores/members-store'
import { useTransactionsStore } from '@/stores/transactions-store'
import {
  CashTrendChart,
  type CashTrendPoint,
} from './components/cash-trend-chart'
import {
  WeeklyFlowChart,
  type WeeklyFlowPoint,
} from './components/weekly-flow-chart'

const OUT_STATUSES = ['Terverifikasi', 'Disetujui']
const DAY_MS = 24 * 60 * 60 * 1000

function dayLabel(d: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(d)
}

export function Dashboard() {
  const { activeRole } = useRole()
  const cashIns = useCashInStore((s) => s.cashIns)
  const expenses = useExpensesStore((s) => s.expenses)
  const transactions = useTransactionsStore((s) => s.transactions)
  const members = useMembersStore((s) => s.members)
  const loans = useLoansStore((s) => s.loans)
  const initialCash = useFinanceConfigStore(
    (s) => s.config.initialCashBalance ?? 0
  )

  const {
    totalOmzet30d,
    nplRatio,
    newMembers90d,
    saldoKas,
    trendData,
    weeklyData,
  } = useMemo(() => {
    const now = Date.now()
    const validTrx = transactions.filter((t) => t.voidStatus !== 'Disetujui')
    const validOut = expenses.filter(
      (e) => OUT_STATUSES.includes(e.status) || e.correctionOfId
    )

    const totalOmzet30d = validTrx
      .filter((t) => now - new Date(t.timestamp).getTime() <= 30 * DAY_MS)
      .reduce((s, t) => s + t.totalCharged, 0)

    const approvedLoans = loans.filter((l) => l.status === 'Disetujui')
    const outstanding = approvedLoans.reduce((s, l) => s + l.amount, 0)
    const pastDue = approvedLoans
      .filter((l) => l.firstDueDate && new Date(l.firstDueDate).getTime() < now)
      .reduce((s, l) => s + l.amount, 0)
    const nplRatio = outstanding > 0 ? (pastDue / outstanding) * 100 : 0

    const newMembers90d = members.filter(
      (m) => now - new Date(m.joinDate).getTime() <= 90 * DAY_MS
    ).length

    const totalIn = cashIns.reduce((s, c) => s + c.amount, 0)
    const totalOut = validOut.reduce((s, e) => s + e.amount, 0)
    const saldoKas = initialCash + totalIn - totalOut

    // Tren saldo 30 hari: mundur dari saldo hari ini per hari.
    const trendData: CashTrendPoint[] = []
    let running = saldoKas
    for (let i = 0; i < 30; i++) {
      const dayStart = now - (i + 1) * DAY_MS
      const dayEnd = now - i * DAY_MS
      trendData.unshift({
        label: dayLabel(new Date(dayEnd)),
        saldo: Math.max(0, Math.round(running)),
      })
      const inDay = cashIns
        .filter((c) => {
          const t = new Date(c.date).getTime()
          return t >= dayStart && t < dayEnd
        })
        .reduce((s, c) => s + c.amount, 0)
      const outDay = validOut
        .filter((e) => {
          const t = new Date(e.date).getTime()
          return t >= dayStart && t < dayEnd
        })
        .reduce((s, e) => s + e.amount, 0)
      running -= inDay - outDay
    }

    // Arus kas per minggu (6 minggu terakhir).
    const weeklyData: WeeklyFlowPoint[] = []
    for (let w = 5; w >= 0; w--) {
      const start = now - (w + 1) * 7 * DAY_MS
      const end = now - w * 7 * DAY_MS
      const masuk = cashIns
        .filter((c) => {
          const t = new Date(c.date).getTime()
          return t >= start && t < end
        })
        .reduce((s, c) => s + c.amount, 0)
      const keluar = validOut
        .filter((e) => {
          const t = new Date(e.date).getTime()
          return t >= start && t < end
        })
        .reduce((s, e) => s + e.amount, 0)
      weeklyData.push({
        label: w === 0 ? 'Minggu ini' : `-${w} mgg`,
        masuk,
        keluar,
      })
    }

    return {
      totalOmzet30d,
      nplRatio,
      newMembers90d,
      saldoKas,
      trendData,
      weeklyData,
    }
  }, [cashIns, expenses, transactions, members, loans, initialCash])

  const stats = [
    {
      title: 'Total Omzet (30 hari)',
      value: formatCurrency(totalOmzet30d),
      icon: TrendingUp,
      note: 'Penjualan gerai, transaksi void dikecualikan',
    },
    {
      title: 'Rasio Kredit Macet',
      value: `${nplRatio.toFixed(1)}%`,
      icon: AlertTriangle,
      note:
        nplRatio > 5
          ? 'Di atas ambang sehat 5% — perlu perhatian'
          : 'Di bawah ambang sehat 5%',
      alert: nplRatio > 5,
    },
    {
      title: 'Anggota Baru (90 hari)',
      value: String(newMembers90d),
      icon: UserPlus,
      note: 'Registrasi via Sekretaris',
    },
    {
      title: 'Saldo Kas',
      value: formatCurrency(saldoKas),
      icon: Wallet,
      note: 'Saldo awal + kas masuk − kas keluar',
    },
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
          <h1 className='text-2xl font-bold tracking-tight'>
            Dashboard Eksekutif
          </h1>
          <p className='text-muted-foreground'>
            Ringkasan kondisi koperasi lintas modul — data yang sama menjadi
            sumber grafik transparansi di aplikasi anggota.
          </p>
        </div>

        {activeRole === 'ketua' && <OverdueApprovalsBanner />}

        <div className='mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className={`size-4 ${stat.alert ? 'text-destructive' : 'text-muted-foreground'}`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${stat.alert ? 'text-destructive' : ''}`}
                >
                  {stat.value}
                </div>
                <p className='text-xs text-muted-foreground'>{stat.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Banknote className='size-4 text-muted-foreground' /> Tren Kas
                — 30 Hari Terakhir
              </CardTitle>
              <CardDescription>
                Saldo kas harian berdasarkan ledger append-only.
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-0'>
              <CashTrendChart data={trendData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Arus Kas Mingguan</CardTitle>
              <CardDescription>
                Kas masuk vs kas keluar, 6 minggu terakhir.
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-0'>
              <WeeklyFlowChart data={weeklyData} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
