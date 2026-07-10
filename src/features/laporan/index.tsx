import { useMemo, useState } from 'react'
import { FileDown, Send } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useKoperasiProfileStore } from '@/stores/koperasi-profile-store'

type Period = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

const PERIOD_DAYS: Record<Period, number> = {
  harian: 1,
  mingguan: 7,
  bulanan: 30,
  tahunan: 365,
}

const PERIOD_LABELS: Record<Period, string> = {
  harian: 'Harian (hari ini)',
  mingguan: 'Mingguan (7 hari)',
  bulanan: 'Bulanan (30 hari)',
  tahunan: 'Tahunan (365 hari)',
}

export function Laporan() {
  const { activeRole, hasAccess } = useRoleAccess([
    'bendahara',
    'ketua',
    'pengawas',
  ])
  const [period, setPeriod] = useState<Period>('bulanan')
  const cashIns = useCashInStore((s) => s.cashIns)
  const expenses = useExpensesStore((s) => s.expenses)
  const initialCash = useFinanceConfigStore(
    (s) => s.config.initialCashBalance ?? 0
  )
  const koperasiName = useKoperasiProfileStore((s) => s.profile.name)

  const report = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period])
    cutoff.setHours(0, 0, 0, 0)

    const inPeriod = cashIns.filter((c) => new Date(c.date) >= cutoff)
    const outPeriod = expenses.filter(
      (e) =>
        new Date(e.date) >= cutoff &&
        e.status !== 'Ditolak' &&
        e.status !== 'Menunggu Approval'
    )

    const inByType = new Map<string, number>()
    for (const c of inPeriod) {
      inByType.set(c.type, (inByType.get(c.type) ?? 0) + c.amount)
    }
    const outByCategory = new Map<string, number>()
    for (const e of outPeriod) {
      outByCategory.set(
        e.category,
        (outByCategory.get(e.category) ?? 0) + e.amount
      )
    }

    const totalIn = inPeriod.reduce((s, c) => s + c.amount, 0)
    const totalOut = outPeriod.reduce((s, e) => s + e.amount, 0)

    // Neraca sederhana (basis kas): posisi berjalan seluruh data.
    const allIn = cashIns.reduce((s, c) => s + c.amount, 0)
    const allOut = expenses
      .filter((e) => e.status !== 'Ditolak' && e.status !== 'Menunggu Approval')
      .reduce((s, e) => s + e.amount, 0)
    const simpananAnggota = cashIns
      .filter((c) => c.type.startsWith('Simpanan'))
      .reduce((s, c) => s + c.amount, 0)
    const kasAkhir = initialCash + allIn - allOut

    return {
      inByType: [...inByType.entries()],
      outByCategory: [...outByCategory.entries()],
      totalIn,
      totalOut,
      netto: totalIn - totalOut,
      kasAkhir,
      simpananAnggota,
      shuBerjalan: kasAkhir - initialCash - simpananAnggota,
    }
  }, [period, cashIns, expenses, initialCash])

  const waText = [
    `Laporan Keuangan ${koperasiName} — ${PERIOD_LABELS[period]}`,
    `Per ${formatDate(new Date().toISOString())}`,
    '',
    `Kas Masuk: ${formatCurrency(report.totalIn)}`,
    `Kas Keluar: ${formatCurrency(report.totalOut)}`,
    `Arus Kas Netto: ${formatCurrency(report.netto)}`,
    `Saldo Kas Akhir: ${formatCurrency(report.kasAkhir)}`,
    '',
    'Detail lengkap tersedia di dashboard read-only Pengawas (SiCerah).',
  ].join('\n')

  return (
    <>
      <div className='print:hidden'>
        <Header>
          <Search className='me-auto' />
          <RoleSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
      </div>
      <Main>
        <div className='mb-4 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Laporan Keuangan
            </h2>
            <p className='text-muted-foreground print:hidden'>
              Arus kas, laba rugi, dan neraca per periode — export PDF atau
              kirim ringkasan ke Pengawas.
            </p>
            <p className='hidden text-muted-foreground print:block'>
              {koperasiName} — {PERIOD_LABELS[period]} — dicetak{' '}
              {formatDate(new Date().toISOString())}
            </p>
          </div>
          <div className='flex flex-wrap gap-2 print:hidden'>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PERIOD_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={() => window.print()}>
              <FileDown className='size-4' /> Export PDF
            </Button>
            <Button asChild variant='outline'>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                target='_blank'
                rel='noreferrer'
              >
                <Send className='size-4' /> Kirim ke Pengawas
              </a>
            </Button>
          </div>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}

        <div className='grid gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Arus Kas — {PERIOD_LABELS[period]}</CardTitle>
              <CardDescription>Pemasukan per jenis dan pengeluaran per kategori.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pos</TableHead>
                    <TableHead className='text-end'>Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.inByType.map(([type, amount]) => (
                    <TableRow key={type}>
                      <TableCell>Masuk — {type}</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {report.outByCategory.map(([cat, amount]) => (
                    <TableRow key={cat}>
                      <TableCell>Keluar — {cat}</TableCell>
                      <TableCell className='text-end text-destructive'>
                        −{formatCurrency(amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className='font-semibold'>
                    <TableCell>Arus Kas Netto</TableCell>
                    <TableCell className='text-end'>
                      {formatCurrency(report.netto)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Laba Rugi — {PERIOD_LABELS[period]}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Pendapatan (kas masuk)</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(report.totalIn)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Beban (kas keluar)</TableCell>
                      <TableCell className='text-end text-destructive'>
                        −{formatCurrency(report.totalOut)}
                      </TableCell>
                    </TableRow>
                    <TableRow className='font-semibold'>
                      <TableCell>Laba/Rugi Periode</TableCell>
                      <TableCell
                        className={`text-end ${report.netto < 0 ? 'text-destructive' : ''}`}
                      >
                        {formatCurrency(report.netto)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Neraca (Basis Kas, Posisi Berjalan)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Aset — Kas</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(report.kasAkhir)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kewajiban — Simpanan Anggota</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(report.simpananAnggota)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ekuitas — Modal Awal (C&#8320;)</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(initialCash)}
                      </TableCell>
                    </TableRow>
                    <TableRow className='font-semibold'>
                      <TableCell>Ekuitas — SHU Berjalan</TableCell>
                      <TableCell
                        className={`text-end ${report.shuBerjalan < 0 ? 'text-destructive' : ''}`}
                      >
                        {formatCurrency(report.shuBerjalan)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
