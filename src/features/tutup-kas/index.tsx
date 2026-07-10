import { useMemo, useState } from 'react'
import { CheckCircle2, Scale } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useCashClosingStore } from '@/stores/cash-closing-store'
import { useTransactionsStore } from '@/stores/transactions-store'

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function ClosingForm({ disabled }: { disabled: boolean }) {
  const { activeRole } = useRoleAccess(['kasir'])
  const transactions = useTransactionsStore((s) => s.transactions)
  const closings = useCashClosingStore((s) => s.closings)
  const submitClosing = useCashClosingStore((s) => s.submitClosing)
  const [physicalCash, setPhysicalCash] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const todayTrx = useMemo(
    () =>
      transactions.filter(
        (t) => isToday(t.timestamp) && t.voidStatus !== 'Disetujui'
      ),
    [transactions]
  )
  const systemTotal = todayTrx.reduce((sum, t) => sum + t.totalCharged, 0)
  const alreadyClosedToday = closings.some((c) => isToday(c.date))
  const parsed = Number(physicalCash)
  const difference = parsed - systemTotal

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutup Kas Hari Ini</CardTitle>
        <CardDescription>
          Rekap penjualan hari ini (transaksi void tidak dihitung), hitung
          selisih kas sistem vs fisik, lalu submit ke Bendahara.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <div className='rounded-md border p-3'>
            <p className='text-sm text-muted-foreground'>Jumlah Transaksi</p>
            <p className='text-2xl font-bold'>{todayTrx.length}</p>
          </div>
          <div className='rounded-md border p-3'>
            <p className='text-sm text-muted-foreground'>Total Kas Sistem</p>
            <p className='text-2xl font-bold'>{formatCurrency(systemTotal)}</p>
          </div>
          <div className='rounded-md border p-3'>
            <p className='text-sm text-muted-foreground'>Selisih</p>
            <p
              className={`text-2xl font-bold ${
                physicalCash === ''
                  ? 'text-muted-foreground'
                  : difference === 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-destructive'
              }`}
            >
              {physicalCash === '' ? '—' : formatCurrency(difference)}
            </p>
          </div>
        </div>

        {alreadyClosedToday ? (
          <div className='flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground'>
            <CheckCircle2 className='size-4' /> Kas hari ini sudah ditutup dan
            dikirim ke Bendahara.
          </div>
        ) : (
          <>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='physical-cash'>
                  Jumlah Kas Fisik di Laci (Rp)
                </Label>
                <Input
                  id='physical-cash'
                  type='number'
                  min={0}
                  className='w-60'
                  placeholder='Hitung uang di laci'
                  value={physicalCash}
                  disabled={disabled}
                  onChange={(e) => setPhysicalCash(e.target.value)}
                />
              </div>
              <Button
                disabled={disabled || physicalCash === '' || Number.isNaN(parsed)}
                onClick={() => setConfirmOpen(true)}
              >
                <Scale className='size-4' /> Submit ke Bendahara
              </Button>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='closing-notes'>Catatan (opsional)</Label>
              <Textarea
                id='closing-notes'
                placeholder='cth. Selisih karena uang kembalian belum disetor'
                value={notes}
                disabled={disabled}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Submit tutup kas harian?'
        desc={`Kas sistem ${formatCurrency(systemTotal)}, kas fisik ${formatCurrency(parsed || 0)}, selisih ${formatCurrency(difference || 0)}. Data dikirim ke Bendahara untuk rekonsiliasi.`}
        confirmText='Submit'
        cancelBtnText='Batal'
        handleConfirm={() => {
          submitClosing(
            {
              date: new Date().toISOString(),
              trxCount: todayTrx.length,
              systemTotal,
              physicalCash: parsed,
              notes: notes.trim() || undefined,
            },
            activeRole
          )
          toast.success('Tutup kas dikirim ke Bendahara')
          setConfirmOpen(false)
          setPhysicalCash('')
          setNotes('')
        }}
      />
    </Card>
  )
}

function ClosingHistory() {
  const { activeRole } = useRoleAccess(['bendahara'])
  const closings = useCashClosingStore((s) => s.closings)
  const reconcileClosing = useCashClosingStore((s) => s.reconcileClosing)
  const flagClosing = useCashClosingStore((s) => s.flagClosing)
  const canReconcile = activeRole === 'bendahara'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Tutup Kas</CardTitle>
        <CardDescription>
          {canReconcile
            ? 'Sebagai Bendahara, Anda dapat merekonsiliasi setoran yang masuk.'
            : 'Rekonsiliasi dilakukan oleh Bendahara.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Transaksi</TableHead>
                <TableHead>Kas Sistem</TableHead>
                <TableHead>Kas Fisik</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {closings.length ? (
                closings.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.date)}</TableCell>
                    <TableCell>{c.trxCount}</TableCell>
                    <TableCell>{formatCurrency(c.systemTotal)}</TableCell>
                    <TableCell>{formatCurrency(c.physicalCash)}</TableCell>
                    <TableCell
                      className={
                        c.difference === 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-destructive'
                      }
                    >
                      {formatCurrency(c.difference)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === 'Direkonsiliasi'
                            ? 'default'
                            : c.status === 'Selisih Ditandai'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canReconcile && c.status === 'Menunggu Rekonsiliasi' && (
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              reconcileClosing(c.id, activeRole)
                              toast.success('Tutup kas dikonfirmasi & direkonsiliasi')
                            }}
                          >
                            Konfirmasi
                          </Button>
                          {c.difference !== 0 && (
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => {
                                flagClosing(c.id, activeRole)
                                toast.warning(
                                  'Selisih kas ditandai untuk investigasi'
                                )
                              }}
                            >
                              Flag Selisih
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    Belum ada riwayat tutup kas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function TutupKas() {
  const { activeRole, hasAccess } = useRoleAccess([
    'kasir',
    'bendahara',
    'ketua',
  ])
  const isKasir = activeRole === 'kasir'

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
            Tutup Kas Harian
          </h2>
          <p className='text-muted-foreground'>
            Rekonsiliasi kas sistem vs kas fisik di akhir hari.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          {isKasir && <ClosingForm disabled={!hasAccess} />}
          <ClosingHistory />
        </div>
      </Main>
    </>
  )
}
