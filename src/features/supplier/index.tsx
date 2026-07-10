import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Plus, Star } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SelectDropdown } from '@/components/select-dropdown'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  SUPPLIER_TYPES,
  useSuppliersStore,
  type Supplier,
} from '@/stores/suppliers-store'

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  contactPhone: z.string().min(9, 'Kontak wajib diisi'),
  commodity: z.string().min(1, 'Komoditas wajib diisi'),
  type: z.enum(['Petani Lokal', 'Pengrajin', 'UMKM Desa', 'Distributor']),
  initialPrice: z.coerce.number().optional(),
})

function Stars({ score }: { score: number }) {
  if (!score) return <span className='text-xs text-muted-foreground'>Belum dinilai</span>
  return (
    <span className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < score ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`}
        />
      ))}
    </span>
  )
}

function AddSupplierDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { activeRole } = useRole()
  const addSupplier = useSuppliersStore((s) => s.addSupplier)

  const form = useForm<
    z.input<typeof supplierFormSchema>,
    unknown,
    z.output<typeof supplierFormSchema>
  >({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      contactPhone: '',
      commodity: '',
      type: 'Petani Lokal',
      initialPrice: 0,
    },
  })

  const onSubmit = (data: z.output<typeof supplierFormSchema>) => {
    addSupplier(
      {
        name: data.name,
        contactPhone: data.contactPhone,
        commodity: data.commodity,
        type: data.type,
        initialPrice: data.initialPrice || undefined,
      },
      activeRole
    )
    toast.success('Mitra supplier terdaftar')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daftarkan Mitra Supplier / UMKM</DialogTitle>
          <DialogDescription>
            Termasuk supplier warga desa lokal: petani, pengrajin, dan UMKM.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='supplier-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder='Nama orang / usaha' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='contactPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontak (WA)</FormLabel>
                    <FormControl>
                      <Input placeholder='08xxxxxxxxxx' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={SUPPLIER_TYPES.map((t) => ({
                        label: t,
                        value: t,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='commodity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komoditas</FormLabel>
                    <FormControl>
                      <Input placeholder='cth. Kopi robusta' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='initialPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Awal (Rp, opsional)</FormLabel>
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
          </form>
        </Form>
        <DialogFooter>
          <Button form='supplier-form' type='submit'>
            Daftarkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SupplierDetailSheet({
  supplier,
  onClose,
}: {
  supplier: Supplier
  onClose: () => void
}) {
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className='flex flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='text-start'>
          <SheetTitle>{supplier.name}</SheetTitle>
          <SheetDescription>
            {supplier.type} — {supplier.commodity} — {supplier.contactPhone}
          </SheetDescription>
        </SheetHeader>
        <div className='flex-1 space-y-4 overflow-y-auto px-4'>
          <div>
            <p className='mb-2 text-sm font-medium'>Evaluasi Performa</p>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  Ketepatan waktu pengiriman
                </span>
                <Badge
                  variant={supplier.onTimePct >= 85 ? 'default' : 'secondary'}
                >
                  {supplier.onTimePct}%
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Kualitas barang</span>
                <Stars score={supplier.qualityScore} />
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  Konsistensi harga
                </span>
                <Stars score={supplier.priceConsistencyScore} />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className='mb-2 text-sm font-medium'>Riwayat Harga</p>
            {supplier.priceHistory.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className='text-end'>Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplier.priceHistory.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(p.date)}</TableCell>
                      <TableCell className='text-end'>
                        {formatCurrency(p.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Belum ada riwayat harga.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SupplierPage() {
  const { activeRole, hasAccess } = useRoleAccess(['logistik', 'ketua'])
  const suppliers = useSuppliersStore((s) => s.suppliers)
  const [addOpen, setAddOpen] = useState(false)
  const [detail, setDetail] = useState<Supplier | null>(null)
  const canInput = activeRole === 'logistik'

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
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Mitra Supplier &amp; UMKM
            </h2>
            <p className='text-muted-foreground'>
              Database supplier dengan riwayat harga dan evaluasi performa
              sebagai dasar keputusan reorder.
            </p>
          </div>
          <Button
            disabled={!hasAccess || !canInput}
            onClick={() => setAddOpen(true)}
          >
            <Plus className='size-4' /> Daftarkan Mitra
          </Button>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Mitra</CardTitle>
            <CardDescription>
              Evaluasi: ketepatan waktu, kualitas barang, dan konsistensi
              harga.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Tepat Waktu</TableHead>
                    <TableHead>Kualitas</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className='flex max-w-52 flex-col'>
                          <span className='truncate'>{s.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {s.contactPhone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.type === 'Distributor' ? 'outline' : 'secondary'
                          }
                        >
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.commodity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={s.onTimePct >= 85 ? 'default' : 'secondary'}
                        >
                          {s.onTimePct}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Stars score={s.qualityScore} />
                      </TableCell>
                      <TableCell>
                        <Stars score={s.priceConsistencyScore} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setDetail(s)}
                        >
                          <Eye className='size-4' /> Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
      <AddSupplierDialog open={addOpen} onOpenChange={setAddOpen} />
      {detail && (
        <SupplierDetailSheet supplier={detail} onClose={() => setDetail(null)} />
      )}
    </>
  )
}
