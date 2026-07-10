import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Handshake, PackageCheck, Plus } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  useContractsStore,
  type ForwardContract,
} from '@/stores/contracts-store'

const buyContractFormSchema = z.object({
  partnerName: z.string().min(1, 'Nama petani/UMKM wajib diisi'),
  commodity: z.string().min(1, 'Komoditas wajib diisi'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  pricePerUnit: z.coerce.number().positive('Harga harus lebih dari 0'),
  targetQty: z.coerce.number().positive('Kuantitas harus lebih dari 0'),
  dueDate: z.string().min(1, 'Perkiraan panen wajib diisi'),
})

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className='flex items-center gap-2'>
      <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full rounded-full bg-primary transition-all'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='w-10 text-end text-xs text-muted-foreground'>
        {pct}%
      </span>
    </div>
  )
}

function AddBuyContractDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { activeRole } = useRole()
  const addBuyContract = useContractsStore((s) => s.addBuyContract)

  const form = useForm<
    z.input<typeof buyContractFormSchema>,
    unknown,
    z.output<typeof buyContractFormSchema>
  >({
    resolver: zodResolver(buyContractFormSchema),
    defaultValues: {
      partnerName: '',
      commodity: '',
      unit: 'kg',
      pricePerUnit: 0,
      targetQty: 0,
      dueDate: '',
    },
  })

  const onSubmit = (data: z.output<typeof buyContractFormSchema>) => {
    addBuyContract(
      { ...data, dueDate: new Date(data.dueDate).toISOString() },
      activeRole
    )
    toast.success('Kontrak beli dibuat — harga panen terkunci')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kunci Harga Beli Hasil Panen</DialogTitle>
          <DialogDescription>
            Harga disepakati sebelum panen tiba — petani mendapat kepastian
            harga, tidak dipermainkan tengkulak.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='buy-contract-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='partnerName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petani / UMKM</FormLabel>
                  <FormControl>
                    <Input placeholder='Nama petani atau kelompok' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='commodity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komoditas</FormLabel>
                    <FormControl>
                      <Input placeholder='cth. Gabah kering' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input placeholder='kg / ton / karung' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='pricePerUnit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Kunci per Satuan (Rp)</FormLabel>
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
                name='targetQty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuantitas Target</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perkiraan Panen</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button form='buy-contract-form' type='submit'>
            <Handshake className='size-4' /> Kunci Kontrak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RecordDeliveryDialog({
  contract,
  groupName,
  onClose,
}: {
  contract: ForwardContract
  groupName?: string
  onClose: () => void
}) {
  const { activeRole } = useRole()
  const recordDelivery = useContractsStore((s) => s.recordDelivery)
  const [qty, setQty] = useState('')
  const parsed = Number(qty)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Catat Setoran</DialogTitle>
          <DialogDescription>
            {contract.contractNo} — {contract.commodity}
            {groupName ? ` — ${groupName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='delivery-qty'>Jumlah ({contract.unit})</Label>
          <Input
            id='delivery-qty'
            type='number'
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={!qty || Number.isNaN(parsed) || parsed <= 0}
            onClick={() => {
              recordDelivery(contract.id, parsed, groupName, activeRole)
              toast.success('Setoran tercatat, progress diperbarui')
              onClose()
            }}
          >
            <PackageCheck className='size-4' /> Catat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Kontrak() {
  const { activeRole, hasAccess } = useRoleAccess(['logistik', 'ketua'])
  const contracts = useContractsStore((s) => s.contracts)
  const [addOpen, setAddOpen] = useState(false)
  const [delivery, setDelivery] = useState<{
    contract: ForwardContract
    groupName?: string
  } | null>(null)
  const canInput = activeRole === 'logistik'

  const buys = contracts.filter((c) => c.type === 'beli')
  const sells = contracts.filter((c) => c.type === 'jual')

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
            Forward Contract
          </h2>
          <p className='text-muted-foreground'>
            Kunci harga beli panen dari petani lokal, dan kontrak suplai ke
            buyer kota dengan kuota per kelompok tani.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Tabs defaultValue='beli' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='beli'>Kopdes sebagai Pembeli</TabsTrigger>
            <TabsTrigger value='jual'>Kopdes sebagai Penjual</TabsTrigger>
          </TabsList>

          <TabsContent value='beli' className='space-y-4'>
            <div className='flex justify-end'>
              <Button
                disabled={!hasAccess || !canInput}
                onClick={() => setAddOpen(true)}
              >
                <Plus className='size-4' /> Kontrak Beli Baru
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Kontrak Beli — Kunci Harga Panen</CardTitle>
                <CardDescription>
                  Petani mendapat kepastian harga sebelum panen tiba.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Petani / UMKM</TableHead>
                        <TableHead>Komoditas</TableHead>
                        <TableHead className='text-end'>Harga Kunci</TableHead>
                        <TableHead>Setoran</TableHead>
                        <TableHead>Panen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buys.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.contractNo}</TableCell>
                          <TableCell className='max-w-44 truncate'>
                            {c.partnerName}
                          </TableCell>
                          <TableCell>{c.commodity}</TableCell>
                          <TableCell className='text-end whitespace-nowrap'>
                            {formatCurrency(c.pricePerUnit)}/{c.unit}
                          </TableCell>
                          <TableCell className='min-w-36'>
                            <div className='flex flex-col gap-1'>
                              <span className='text-xs text-muted-foreground'>
                                {c.deliveredQty}/{c.targetQty} {c.unit}
                              </span>
                              <ProgressBar
                                value={c.deliveredQty}
                                max={c.targetQty}
                              />
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(c.dueDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                c.status === 'Selesai' ? 'default' : 'secondary'
                              }
                            >
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {canInput && c.status === 'Aktif' && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setDelivery({ contract: c })}
                              >
                                Catat Setoran
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
          </TabsContent>

          <TabsContent value='jual' className='space-y-4'>
            {sells.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <div className='flex flex-wrap items-start justify-between gap-2'>
                    <div>
                      <CardTitle>
                        {c.contractNo} — {c.commodity}
                      </CardTitle>
                      <CardDescription>
                        Buyer: {c.partnerName} · {formatCurrency(c.pricePerUnit)}
                        /{c.unit} · tenggat {formatDate(c.dueDate)} · buyer
                        memantau progress secara real-time
                      </CardDescription>
                    </div>
                    <Badge
                      variant={c.status === 'Selesai' ? 'default' : 'secondary'}
                    >
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <div className='mb-1 flex items-center justify-between text-sm'>
                      <span className='font-medium'>Progress Total</span>
                      <span className='text-muted-foreground'>
                        {c.deliveredQty}/{c.targetQty} {c.unit}
                      </span>
                    </div>
                    <ProgressBar value={c.deliveredQty} max={c.targetQty} />
                  </div>
                  {c.quotas && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium'>
                        Kuota per Kelompok Tani
                      </p>
                      {c.quotas.map((q) => (
                        <div
                          key={q.groupName}
                          className='flex flex-wrap items-center gap-3 rounded-md border p-3'
                        >
                          <div className='min-w-44 flex-1'>
                            <p className='text-sm'>{q.groupName}</p>
                            <p className='text-xs text-muted-foreground'>
                              {q.deliveredQty}/{q.targetQty} {c.unit}
                            </p>
                          </div>
                          <div className='w-48'>
                            <ProgressBar
                              value={q.deliveredQty}
                              max={q.targetQty}
                            />
                          </div>
                          {canInput &&
                            c.status === 'Aktif' &&
                            q.deliveredQty < q.targetQty && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  setDelivery({
                                    contract: c,
                                    groupName: q.groupName,
                                  })
                                }
                              >
                                Catat Setoran
                              </Button>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Main>
      <AddBuyContractDialog open={addOpen} onOpenChange={setAddOpen} />
      {delivery && (
        <RecordDeliveryDialog
          contract={delivery.contract}
          groupName={delivery.groupName}
          onClose={() => setDelivery(null)}
        />
      )}
    </>
  )
}
