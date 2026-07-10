import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilePenLine } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  CASH_IN_TYPES,
  useCashInStore,
  type CashIn,
} from '@/stores/cash-in-store'

const cashInFormSchema = z.object({
  type: z.enum([
    'Simpanan Pokok',
    'Simpanan Wajib',
    'Simpanan Sukarela',
    'Angsuran Pinjaman',
    'Omzet Gerai Harian',
  ]),
  memberName: z.string().optional(),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
})

function CashInForm({ disabled }: { disabled: boolean }) {
  const { activeRole } = useRole()
  const addCashIn = useCashInStore((s) => s.addCashIn)

  const form = useForm<
    z.input<typeof cashInFormSchema>,
    unknown,
    z.output<typeof cashInFormSchema>
  >({
    resolver: zodResolver(cashInFormSchema),
    defaultValues: {
      type: 'Simpanan Wajib',
      memberName: '',
      description: '',
      amount: 0,
    },
  })

  const type = form.watch('type')
  const needsMember = type !== 'Omzet Gerai Harian'

  const onSubmit = (data: z.output<typeof cashInFormSchema>) => {
    addCashIn(
      {
        date: new Date().toISOString(),
        type: data.type,
        memberName: needsMember ? data.memberName || undefined : undefined,
        description: data.description,
        amount: data.amount,
      },
      activeRole
    )
    toast.success('Kas masuk tercatat')
    form.reset({
      type: data.type,
      memberName: '',
      description: '',
      amount: 0,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Kas Masuk</CardTitle>
        <CardDescription>
          Simpanan anggota, angsuran pinjaman, atau rekap omzet gerai harian
          dari Kasir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <fieldset disabled={disabled} className='contents'>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        items={CASH_IN_TYPES.map((t) => ({
                          label: t,
                          value: t,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {needsMember && (
                  <FormField
                    control={form.control}
                    name='memberName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Anggota</FormLabel>
                        <FormControl>
                          <Input placeholder='Nama anggota' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nominal (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          {...field}
                          value={field.value as string | number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input placeholder='Keterangan singkat' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' disabled={disabled}>
                Catat Kas Masuk
              </Button>
            </form>
          </fieldset>
        </Form>
      </CardContent>
    </Card>
  )
}

function CorrectionDialog({
  entry,
  onClose,
}: {
  entry: CashIn
  onClose: () => void
}) {
  const { activeRole } = useRole()
  const addCorrection = useCashInStore((s) => s.addCorrection)
  const [newAmount, setNewAmount] = useState(String(entry.amount))
  const [reason, setReason] = useState('')
  const parsed = Number(newAmount)
  const delta = parsed - entry.amount

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Koreksi {entry.cashInNo} (Append-Only)</DialogTitle>
          <DialogDescription>
            Entri asli tidak diubah. Sistem membuat entri baru berisi selisih
            yang mereferensi entri salah — keduanya tetap tercatat di ledger.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm'>
            Nominal tercatat:{' '}
            <span className='font-medium'>{formatCurrency(entry.amount)}</span>
          </p>
          <div className='space-y-2'>
            <Label htmlFor='correct-amount'>Nominal Seharusnya (Rp)</Label>
            <Input
              id='correct-amount'
              type='number'
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            {!Number.isNaN(parsed) && delta !== 0 && (
              <p className='text-xs text-muted-foreground'>
                Entri koreksi akan dibuat sebesar {formatCurrency(delta)}.
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='correct-reason'>Alasan Koreksi</Label>
            <Textarea
              id='correct-reason'
              placeholder='cth. Salah ketik nominal setoran'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={!reason.trim() || Number.isNaN(parsed) || delta === 0}
            onClick={() => {
              addCorrection(entry.id, parsed, reason.trim(), activeRole)
              toast.success('Entri koreksi ditambahkan ke ledger')
              onClose()
            }}
          >
            Buat Entri Koreksi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function KasMasuk() {
  const { activeRole, hasAccess } = useRoleAccess(['bendahara', 'ketua'])
  const cashIns = useCashInStore((s) => s.cashIns)
  const [correcting, setCorrecting] = useState<CashIn | null>(null)
  const canInput = activeRole === 'bendahara'

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
          <h2 className='text-2xl font-bold tracking-tight'>Kas Masuk</h2>
          <p className='text-muted-foreground'>
            Pencatatan simpanan, angsuran, dan omzet gerai — ledger
            append-only, koreksi lewat entri baru.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          {canInput && <CashInForm disabled={!hasAccess} />}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kas Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className='text-end'>Nominal</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashIns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.cashInNo}</TableCell>
                        <TableCell>{formatDate(c.date)}</TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            <Badge variant='outline'>{c.type}</Badge>
                            {c.correctionOfId && (
                              <Badge variant='secondary'>
                                Koreksi {c.correctionOfNo}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{c.memberName ?? '—'}</TableCell>
                        <TableCell className='max-w-60 truncate'>
                          {c.description}
                        </TableCell>
                        <TableCell
                          className={`text-end ${c.amount < 0 ? 'text-destructive' : ''}`}
                        >
                          {formatCurrency(c.amount)}
                        </TableCell>
                        <TableCell>
                          {canInput && !c.correctionOfId && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setCorrecting(c)}
                            >
                              <FilePenLine className='size-4' /> Koreksi
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
      {correcting && (
        <CorrectionDialog
          entry={correcting}
          onClose={() => setCorrecting(null)}
        />
      )}
    </>
  )
}
