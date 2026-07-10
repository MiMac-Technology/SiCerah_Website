import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, PackagePlus, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { formatDate } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PhotoUploadField } from '@/components/photo-upload-field'
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
import { useProductsStore, type Product } from '@/stores/products-store'

const stockInFormSchema = z.object({
  productId: z.string().min(1, 'Pilih produk'),
  qty: z.coerce.number().positive('Qty harus lebih dari 0'),
  supplierName: z.string().min(1, 'Nama supplier wajib diisi'),
  deliveryNotePhotoDataUrl: z
    .string()
    .min(1, 'Foto surat jalan wajib diunggah'),
})

function StockInDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { activeRole } = useRole()
  const products = useProductsStore((s) => s.products)
  const addStockIn = useProductsStore((s) => s.addStockIn)

  const form = useForm<
    z.input<typeof stockInFormSchema>,
    unknown,
    z.output<typeof stockInFormSchema>
  >({
    resolver: zodResolver(stockInFormSchema),
    defaultValues: {
      productId: '',
      qty: 0,
      supplierName: '',
      deliveryNotePhotoDataUrl: '',
    },
  })

  const onSubmit = (data: z.output<typeof stockInFormSchema>) => {
    addStockIn(data, activeRole)
    toast.success('Barang masuk tercatat, stok bertambah')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Barang Masuk</DialogTitle>
          <DialogDescription>
            Foto surat jalan wajib diunggah sebagai bukti penerimaan barang.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='stock-in-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='productId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Pilih produk'
                    items={products.map((p) => ({
                      label: `${p.name} (stok ${p.stock} ${p.unit})`,
                      value: p.id,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='qty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Masuk</FormLabel>
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
                name='supplierName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder='Nama supplier' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='deliveryNotePhotoDataUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto Surat Jalan</FormLabel>
                  <FormControl>
                    <PhotoUploadField
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? '')}
                      description='Bukti penerimaan barang dari supplier.'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button form='stock-in-form' type='submit'>
            <PackagePlus className='size-4' /> Catat Barang Masuk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OpnameDialog({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const { activeRole } = useRole()
  const recordOpname = useProductsStore((s) => s.recordOpname)
  const [physical, setPhysical] = useState('')
  const [notes, setNotes] = useState('')
  const parsed = Number(physical)
  const diff = parsed - product.stock

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stok Opname — {product.name}</DialogTitle>
          <DialogDescription>
            Stok sistem saat ini: {product.stock} {product.unit} (stok keluar
            otomatis sinkron dari POS Kasir). Hitung fisik di gudang lalu catat
            selisihnya.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='physical-count'>
              Hasil Hitung Fisik ({product.unit})
            </Label>
            <Input
              id='physical-count'
              type='number'
              min={0}
              value={physical}
              onChange={(e) => setPhysical(e.target.value)}
            />
            {physical !== '' && !Number.isNaN(parsed) && (
              <p
                className={`text-xs ${diff === 0 ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                Selisih vs sistem: {diff > 0 ? '+' : ''}
                {diff} {product.unit}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='opname-notes'>Catatan (opsional)</Label>
            <Textarea
              id='opname-notes'
              placeholder='cth. Kemasan rusak 2 pak'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={physical === '' || Number.isNaN(parsed) || parsed < 0}
            onClick={() => {
              recordOpname(product.id, parsed, notes.trim() || undefined, activeRole)
              toast.success('Stok opname tercatat, stok sistem disesuaikan')
              onClose()
            }}
          >
            Simpan Opname
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Stok() {
  const { activeRole, hasAccess } = useRoleAccess(['logistik', 'ketua'])
  const products = useProductsStore((s) => s.products)
  const stockIns = useProductsStore((s) => s.stockIns)
  const opnames = useProductsStore((s) => s.opnames)
  const [stockInOpen, setStockInOpen] = useState(false)
  const [opnameTarget, setOpnameTarget] = useState<Product | null>(null)
  const canInput = activeRole === 'logistik'

  const lowStock = useMemo(
    () => products.filter((p) => p.stock < p.minThreshold),
    [products]
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
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Manajemen Stok
            </h2>
            <p className='text-muted-foreground'>
              Barang masuk dengan bukti surat jalan, stok opname, dan alert
              stok menipis.
            </p>
          </div>
          <Button disabled={!hasAccess || !canInput} onClick={() => setStockInOpen(true)}>
            <PackagePlus className='size-4' /> Barang Masuk
          </Button>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}

        {lowStock.length > 0 && (
          <Alert variant='destructive' className='mb-4'>
            <TriangleAlert />
            <AlertTitle>
              Alert stok menipis — {lowStock.length} produk di bawah minimum
            </AlertTitle>
            <AlertDescription>
              {lowStock
                .map((p) => `${p.name} (${p.stock}/${p.minThreshold} ${p.unit})`)
                .join(', ')}
              . Notifikasi otomatis dikirim ke Logistik dan Ketua.
            </AlertDescription>
          </Alert>
        )}

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk &amp; Stok</CardTitle>
              <CardDescription>
                Stok keluar otomatis sinkron dari POS Kasir; stok masuk dicatat
                Logistik.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className='text-end'>Stok Sistem</TableHead>
                      <TableHead className='text-end'>Min.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.sku}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell className='text-end'>
                          {p.stock} {p.unit}
                        </TableCell>
                        <TableCell className='text-end'>
                          {p.minThreshold}
                        </TableCell>
                        <TableCell>
                          {p.stock < p.minThreshold ? (
                            <Badge variant='destructive'>Stok Menipis</Badge>
                          ) : (
                            <Badge>Aman</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {canInput && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setOpnameTarget(p)}
                            >
                              <ClipboardList className='size-4' /> Opname
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

          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Barang Masuk</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className='text-end'>Qty</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Bukti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockIns.slice(0, 8).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className='flex flex-col'>
                            {s.stockInNo}
                            <span className='text-xs text-muted-foreground'>
                              {formatDate(s.date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='max-w-36 truncate'>
                          {s.productName}
                        </TableCell>
                        <TableCell className='text-end'>+{s.qty}</TableCell>
                        <TableCell className='max-w-32 truncate'>
                          {s.supplierName}
                        </TableCell>
                        <TableCell>
                          {s.deliveryNotePhotoDataUrl ? (
                            <img
                              src={s.deliveryNotePhotoDataUrl}
                              alt='Surat jalan'
                              className='size-9 rounded border object-cover'
                            />
                          ) : (
                            <Badge variant='outline'>Arsip</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Stok Opname</CardTitle>
              </CardHeader>
              <CardContent>
                {opnames.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className='text-end'>Sistem</TableHead>
                        <TableHead className='text-end'>Fisik</TableHead>
                        <TableHead className='text-end'>Selisih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opnames.slice(0, 8).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>{formatDate(o.date)}</TableCell>
                          <TableCell className='max-w-36 truncate'>
                            {o.productName}
                          </TableCell>
                          <TableCell className='text-end'>
                            {o.systemCount}
                          </TableCell>
                          <TableCell className='text-end'>
                            {o.physicalCount}
                          </TableCell>
                          <TableCell
                            className={`text-end ${o.difference !== 0 ? 'text-destructive' : ''}`}
                          >
                            {o.difference > 0 ? '+' : ''}
                            {o.difference}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className='py-8 text-center text-sm text-muted-foreground'>
                    Belum ada opname. Klik "Opname" pada produk untuk memulai.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
      <StockInDialog open={stockInOpen} onOpenChange={setStockInOpen} />
      {opnameTarget && (
        <OpnameDialog
          product={opnameTarget}
          onClose={() => setOpnameTarget(null)}
        />
      )}
    </>
  )
}
