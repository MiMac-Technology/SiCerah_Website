import { useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useFinanceConfigStore } from '@/stores/finance-config-store'

function InitialCashCard({ disabled }: { disabled: boolean }) {
  const config = useFinanceConfigStore((s) => s.config)
  const setInitialCashBalance = useFinanceConfigStore(
    (s) => s.setInitialCashBalance
  )
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isSet = config.initialCashBalance !== null
  const parsed = Number(amount)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between gap-2'>
          <div>
            <CardTitle>Saldo Kas Awal (C&#8320;)</CardTitle>
            <CardDescription>
              Wajib diisi sebelum transaksi pertama dicatat agar grafik kas
              akurat.
            </CardDescription>
          </div>
          {isSet ? (
            <Badge>
              <CheckCircle2 className='size-3' /> Sudah ditetapkan
            </Badge>
          ) : (
            <Badge variant='destructive'>Belum diisi</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isSet ? (
          <Alert>
            <Lock />
            <AlertTitle>{formatCurrency(config.initialCashBalance!)}</AlertTitle>
            <AlertDescription>
              Ditetapkan pada{' '}
              {config.initialCashSetAt
                ? formatDate(config.initialCashSetAt)
                : '-'}
              . Saldo awal terkunci dan menjadi basis perhitungan grafik kas —
              perubahan hanya dapat dilakukan lewat backend dengan audit.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='flex flex-wrap items-end gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='initial-cash'>Nominal Saldo Awal (Rp)</Label>
              <Input
                id='initial-cash'
                type='number'
                min={0}
                className='w-60'
                placeholder='cth. 25000000'
                value={amount}
                disabled={disabled}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              disabled={disabled || !amount || Number.isNaN(parsed) || parsed < 0}
              onClick={() => setConfirmOpen(true)}
            >
              Tetapkan Saldo Awal
            </Button>
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Tetapkan saldo kas awal?'
        desc={`Saldo awal ${formatCurrency(parsed || 0)} akan dikunci sebagai basis grafik kas dan tidak bisa diubah dari aplikasi ini.`}
        confirmText='Tetapkan &amp; Kunci'
        cancelBtnText='Batal'
        handleConfirm={() => {
          setInitialCashBalance(parsed)
          toast.success('Saldo kas awal ditetapkan')
          setConfirmOpen(false)
        }}
      />
    </Card>
  )
}

function AnnouncementThresholdCard({ disabled }: { disabled: boolean }) {
  const config = useFinanceConfigStore((s) => s.config)
  const updateAnnouncementThreshold = useFinanceConfigStore(
    (s) => s.updateAnnouncementThreshold
  )
  const [amount, setAmount] = useState(String(config.announcementThreshold))
  const parsed = Number(amount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threshold Auto-Announce</CardTitle>
        <CardDescription>
          Semua pengeluaran di atas nominal ini otomatis diumumkan ke seluruh
          anggota di aplikasi mobile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='announce-threshold'>Nominal Minimum (Rp)</Label>
            <Input
              id='announce-threshold'
              type='number'
              min={0}
              className='w-60'
              value={amount}
              disabled={disabled}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button
            disabled={disabled || Number.isNaN(parsed) || parsed <= 0}
            onClick={() => {
              updateAnnouncementThreshold(parsed)
              toast.success(
                `Pengeluaran di atas ${formatCurrency(parsed)} akan auto-announce`
              )
            }}
          >
            Simpan
          </Button>
        </div>
        <p className='mt-2 text-sm text-muted-foreground'>
          Saat ini: {formatCurrency(config.announcementThreshold)}
        </p>
      </CardContent>
    </Card>
  )
}

function FiscalPeriodCard({ disabled }: { disabled: boolean }) {
  const config = useFinanceConfigStore((s) => s.config)
  const updateFiscalPeriod = useFinanceConfigStore((s) => s.updateFiscalPeriod)
  const [start, setStart] = useState(config.fiscalPeriodStart.slice(0, 10))
  const [end, setEnd] = useState(config.fiscalPeriodEnd.slice(0, 10))
  const isValid = start && end && new Date(start) < new Date(end)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Periode Tutup Buku</CardTitle>
        <CardDescription>
          Tahun buku koperasi — sistem menggunakan ini untuk mereset L&#8348;
          dan menghitung SHU final.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='fiscal-start'>Awal Tahun Buku</Label>
            <Input
              id='fiscal-start'
              type='date'
              className='w-45'
              value={start}
              disabled={disabled}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='fiscal-end'>Akhir Tahun Buku</Label>
            <Input
              id='fiscal-end'
              type='date'
              className='w-45'
              value={end}
              disabled={disabled}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <Button
            disabled={disabled || !isValid}
            onClick={() => {
              updateFiscalPeriod(
                new Date(start).toISOString(),
                new Date(end).toISOString()
              )
              toast.success('Periode tutup buku disimpan')
            }}
          >
            Simpan Periode
          </Button>
        </div>
        {!isValid && (
          <p className='mt-2 text-sm text-destructive'>
            Tanggal awal harus sebelum tanggal akhir.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminKeuangan() {
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
            Pengaturan Keuangan
          </h2>
          <p className='text-muted-foreground'>
            Saldo kas awal, threshold pengumuman otomatis, dan periode tutup
            buku.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          <InitialCashCard disabled={!hasAccess} />
          <AnnouncementThresholdCard disabled={!hasAccess} />
          <FiscalPeriodCard disabled={!hasAccess} />
        </div>
      </Main>
    </>
  )
}
