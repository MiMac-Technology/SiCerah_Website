import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { type z } from 'zod'
import { formatCurrency, formatDate } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  getCooperativeProfile,
  updateCooperativeProfile,
  type CooperativeProfile,
} from '@/features/admin-profil/api'
import { createFiscalYear, listFiscalYears } from '@/features/konfigurasi-shu/api'
import { fiscalYearFormSchema } from '@/features/konfigurasi-shu/data/schema'

const PROFILE_QUERY_KEY = ['admin-pengaturan-koperasi']

function saveProfileField(
  profile: CooperativeProfile,
  patch: Partial<{ initialCashBalance: number; announcementThreshold: number }>
) {
  return updateCooperativeProfile({
    nama: profile.nama,
    alamat: profile.alamat,
    nomorBadanHukum: profile.nomor_badan_hukum ?? undefined,
    waBotNumber: profile.wa_bot_number ?? undefined,
    announcementThreshold: Number(profile.announcement_threshold),
    memberApprovalThreshold: Number(profile.member_approval_threshold),
    approvalQuorumPct: Number(profile.approval_quorum_pct),
    initialCashBalance: Number(profile.initial_cash_balance),
    ...patch,
  })
}

function InitialCashCard({ disabled }: { disabled: boolean }) {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getCooperativeProfile,
  })
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const current = profile ? Number(profile.initial_cash_balance) : null
  const parsed = Number(amount)

  const mutation = useMutation({
    mutationFn: (nextAmount: number) => {
      if (!profile) throw new Error('Profil koperasi belum diisi')
      return saveProfileField(profile, { initialCashBalance: nextAmount })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      toast.success('Saldo kas awal ditetapkan')
      setAmount('')
      setConfirmOpen(false)
    },
    onError: (error) => {
      handleServerError(error)
      setConfirmOpen(false)
    },
  })

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
          {current !== null && (
            <Badge>
              <CheckCircle2 className='size-3' /> Sudah ditetapkan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading ? (
          <p className='text-muted-foreground text-sm'>Memuat data...</p>
        ) : !profile ? (
          <Alert variant='destructive'>
            <AlertTitle>Profil koperasi belum diisi</AlertTitle>
            <AlertDescription>
              Lengkapi dulu identitas koperasi di halaman Profil Koperasi
              sebelum menetapkan saldo kas awal.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {current !== null && (
              <Alert>
                <AlertTitle>{formatCurrency(current)}</AlertTitle>
                <AlertDescription>
                  Nilai saat ini — menjadi basis perhitungan grafik kas.
                  Backend menolak perubahan begitu ada transaksi kas
                  tercatat.
                </AlertDescription>
              </Alert>
            )}
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
                  disabled={disabled || mutation.isPending}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                disabled={
                  disabled ||
                  !amount ||
                  Number.isNaN(parsed) ||
                  parsed < 0 ||
                  mutation.isPending
                }
                onClick={() => setConfirmOpen(true)}
              >
                {current !== null ? 'Perbarui Saldo Awal' : 'Tetapkan Saldo Awal'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Tetapkan saldo kas awal?'
        desc={`Saldo awal ${formatCurrency(parsed || 0)} akan menjadi basis grafik kas. Perubahan ditolak backend begitu ada transaksi kas tercatat.`}
        confirmText='Tetapkan'
        cancelBtnText='Batal'
        handleConfirm={() => mutation.mutate(parsed)}
      />
    </Card>
  )
}

function AnnouncementThresholdCard({ disabled }: { disabled: boolean }) {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getCooperativeProfile,
  })
  const [amount, setAmount] = useState('')
  const parsed = Number(amount)

  const mutation = useMutation({
    mutationFn: (nextAmount: number) => {
      if (!profile) throw new Error('Profil koperasi belum diisi')
      return saveProfileField(profile, { announcementThreshold: nextAmount })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      toast.success(`Pengeluaran di atas ${formatCurrency(parsed)} akan auto-announce`)
      setAmount('')
    },
    onError: handleServerError,
  })

  const current = profile ? Number(profile.announcement_threshold) : null

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
        {isLoading ? (
          <p className='text-muted-foreground text-sm'>Memuat data...</p>
        ) : !profile ? (
          <Alert variant='destructive'>
            <AlertTitle>Profil koperasi belum diisi</AlertTitle>
            <AlertDescription>
              Lengkapi dulu identitas koperasi di halaman Profil Koperasi.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='announce-threshold'>Nominal Minimum (Rp)</Label>
                <Input
                  id='announce-threshold'
                  type='number'
                  min={0}
                  className='w-60'
                  placeholder={current !== null ? String(current) : undefined}
                  value={amount}
                  disabled={disabled || mutation.isPending}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                disabled={
                  disabled ||
                  !amount ||
                  Number.isNaN(parsed) ||
                  parsed <= 0 ||
                  mutation.isPending
                }
                onClick={() => mutation.mutate(parsed)}
              >
                Simpan
              </Button>
            </div>
            {current !== null && (
              <p className='mt-2 text-sm text-muted-foreground'>
                Saat ini: {formatCurrency(current)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function NewFiscalYearForm({ disabled }: { disabled: boolean }) {
  const queryClient = useQueryClient()
  const form = useForm<
    z.input<typeof fiscalYearFormSchema>,
    unknown,
    z.output<typeof fiscalYearFormSchema>
  >({
    resolver: zodResolver(fiscalYearFormSchema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: z.output<typeof fiscalYearFormSchema>) =>
      createFiscalYear({
        name: data.name,
        start_date: data.startDate,
        end_date: data.endDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tahun-buku'] })
      toast.success('Tahun buku baru dibuat')
      form.reset()
    },
    onError: handleServerError,
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className='flex flex-wrap items-end gap-3'
    >
      <div className='space-y-2'>
        <Label htmlFor='fiscal-name'>Nama Tahun Buku</Label>
        <Input
          id='fiscal-name'
          className='w-45'
          placeholder='cth. Tahun Buku 2026'
          disabled={disabled || mutation.isPending}
          {...form.register('name')}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='fiscal-start'>Awal</Label>
        <Input
          id='fiscal-start'
          type='date'
          className='w-45'
          disabled={disabled || mutation.isPending}
          {...form.register('startDate')}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='fiscal-end'>Akhir</Label>
        <Input
          id='fiscal-end'
          type='date'
          className='w-45'
          disabled={disabled || mutation.isPending}
          {...form.register('endDate')}
        />
      </div>
      <Button type='submit' disabled={disabled || mutation.isPending}>
        Buat Tahun Buku
      </Button>
      {(form.formState.errors.name ||
        form.formState.errors.startDate ||
        form.formState.errors.endDate) && (
        <p className='w-full text-sm text-destructive'>
          {form.formState.errors.name?.message ??
            form.formState.errors.startDate?.message ??
            form.formState.errors.endDate?.message}
        </p>
      )}
    </form>
  )
}

function FiscalPeriodCard({ disabled }: { disabled: boolean }) {
  const { data: fiscalYears = [], isLoading } = useQuery({
    queryKey: ['admin-tahun-buku'],
    queryFn: listFiscalYears,
  })

  const hasOpenYear = fiscalYears.some((fy) => fy.status === 'open')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Periode Tutup Buku (Tahun Buku)</CardTitle>
        <CardDescription>
          Tahun buku koperasi — sistem menggunakan ini untuk mereset L&#8348;
          dan menghitung SHU final. Konfigurasi parameter SHU serta lock &amp;
          tutup buku dilakukan Bendahara/Ketua di halaman Konfigurasi SHU.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : fiscalYears.length ? (
                fiscalYears.map((fy) => (
                  <TableRow key={fy.id}>
                    <TableCell>{fy.name}</TableCell>
                    <TableCell>{formatDate(fy.start_date)}</TableCell>
                    <TableCell>{formatDate(fy.end_date)}</TableCell>
                    <TableCell>
                      <Badge variant={fy.status === 'open' ? 'default' : 'secondary'}>
                        {fy.status === 'open' ? 'Terbuka' : 'Ditutup'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Belum ada tahun buku.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {hasOpenYear ? (
          <p className='text-sm text-muted-foreground'>
            Sudah ada tahun buku yang masih terbuka. Tutup tahun buku itu
            (lewat Konfigurasi SHU) sebelum membuat yang baru.
          </p>
        ) : (
          <NewFiscalYearForm disabled={disabled} />
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
