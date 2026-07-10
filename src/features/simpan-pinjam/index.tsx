import { useState } from 'react'
import { ArrowUpRight, Check, MessageCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/format'
import { buildWaLink } from '@/lib/whatsapp'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  LOAN_ESCALATION_THRESHOLD,
  useLoansStore,
  type Loan,
  type LoanStatus,
} from '@/stores/loans-store'

const STATUS_VARIANT: Record<
  LoanStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  'Menunggu Bendahara': 'secondary',
  'Menunggu Ketua': 'outline',
  Disetujui: 'default',
  Ditolak: 'destructive',
}

function ApproveDialog({
  loan,
  onClose,
}: {
  loan: Loan
  onClose: () => void
}) {
  const { activeRole } = useRole()
  const approveLoan = useLoansStore((s) => s.approveLoan)
  const defaultDue = new Date()
  defaultDue.setMonth(defaultDue.getMonth() + 1)
  const [firstDue, setFirstDue] = useState(
    defaultDue.toISOString().slice(0, 10)
  )

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Pinjaman {loan.loanNo}</DialogTitle>
          <DialogDescription>
            {loan.memberName} — {formatCurrency(loan.amount)}, tenor{' '}
            {loan.tenorMonths} bulan. Cicilan{' '}
            {formatCurrency(loan.monthlyInstallment)}/bulan.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='first-due'>Jadwal Cicilan Pertama</Label>
          <Input
            id='first-due'
            type='date'
            value={firstDue}
            onChange={(e) => setFirstDue(e.target.value)}
          />
          <p className='text-xs text-muted-foreground'>
            Cicilan berikutnya jatuh tempo tiap bulan pada tanggal yang sama.
            Reminder otomatis dikirim via WhatsApp oleh backend.
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={!firstDue}
            onClick={() => {
              approveLoan(
                loan.id,
                new Date(firstDue).toISOString(),
                activeRole
              )
              toast.success(`Pinjaman ${loan.loanNo} disetujui`)
              onClose()
            }}
          >
            Setujui &amp; Set Jadwal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SimpanPinjam() {
  const { activeRole, hasAccess } = useRoleAccess(['bendahara', 'ketua'])
  const { activeRole: role } = useRole()
  const loans = useLoansStore((s) => s.loans)
  const rejectLoan = useLoansStore((s) => s.rejectLoan)
  const escalateLoan = useLoansStore((s) => s.escalateLoan)
  const logReminderSent = useLoansStore((s) => s.logReminderSent)
  const [approving, setApproving] = useState<Loan | null>(null)

  const isBendahara = role === 'bendahara'
  const isKetua = role === 'ketua'

  const buildReminderLink = (loan: Loan) =>
    buildWaLink(
      loan.phone,
      `Halo ${loan.memberName}, mengingatkan cicilan pinjaman ${loan.loanNo} sebesar ${formatCurrency(loan.monthlyInstallment)} jatuh tempo ${loan.firstDueDate ? formatDate(loan.firstDueDate) : 'bulan ini'}. Terima kasih — ${'Koperasi'}`
    )

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
            Manajemen Simpan Pinjam
          </h2>
          <p className='text-muted-foreground'>
            Approve/reject pengajuan pinjaman anggota. Nilai di atas{' '}
            {formatCurrency(LOAN_ESCALATION_THRESHOLD)} wajib dieskalasi ke
            Ketua.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Card>
          <CardHeader>
            <CardTitle>Pengajuan Pinjaman</CardTitle>
            <CardDescription>
              {isBendahara
                ? 'Anda memutuskan pinjaman nilai kecil; nilai besar dieskalasi ke Ketua.'
                : isKetua
                  ? 'Anda memutuskan pinjaman nilai besar hasil eskalasi Bendahara.'
                  : 'Daftar pengajuan ditampilkan read-only.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead className='text-end'>Nominal</TableHead>
                    <TableHead>Cicilan/Bulan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-end'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const isLarge = loan.amount > LOAN_ESCALATION_THRESHOLD
                    const bendaharaCanDecide =
                      isBendahara &&
                      loan.status === 'Menunggu Bendahara' &&
                      !isLarge
                    const bendaharaMustEscalate =
                      isBendahara &&
                      loan.status === 'Menunggu Bendahara' &&
                      isLarge
                    const ketuaCanDecide =
                      isKetua && loan.status === 'Menunggu Ketua'
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.loanNo}</TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span>{loan.memberName}</span>
                            <span className='text-xs text-muted-foreground'>
                              {loan.memberNo} · tenor {loan.tenorMonths} bln
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='max-w-44 truncate'>
                          {loan.purpose}
                        </TableCell>
                        <TableCell className='text-end'>
                          <div className='flex flex-col items-end'>
                            {formatCurrency(loan.amount)}
                            {isLarge && (
                              <Badge variant='outline' className='mt-1'>
                                Nilai Besar
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(loan.monthlyInstallment)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[loan.status]}>
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex justify-end gap-2'>
                            {(bendaharaCanDecide || ketuaCanDecide) && (
                              <>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => setApproving(loan)}
                                >
                                  <Check className='size-4' /> Setujui
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => {
                                    rejectLoan(loan.id, role)
                                    toast.info(`Pinjaman ${loan.loanNo} ditolak`)
                                  }}
                                >
                                  <X className='size-4' /> Tolak
                                </Button>
                              </>
                            )}
                            {bendaharaMustEscalate && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  escalateLoan(loan.id, role)
                                  toast.success(
                                    `${loan.loanNo} dieskalasi ke Ketua`
                                  )
                                }}
                              >
                                <ArrowUpRight className='size-4' /> Eskalasi ke
                                Ketua
                              </Button>
                            )}
                            {isBendahara && loan.status === 'Disetujui' && (
                              <Button asChild size='sm' variant='outline'>
                                <a
                                  href={buildReminderLink(loan)}
                                  target='_blank'
                                  rel='noreferrer'
                                  onClick={() => logReminderSent(loan.id, role)}
                                >
                                  <MessageCircle className='size-4' /> Reminder
                                  WA
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
      {approving && (
        <ApproveDialog loan={approving} onClose={() => setApproving(null)} />
      )}
    </>
  )
}
