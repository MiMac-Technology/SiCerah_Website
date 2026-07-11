import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { formatDate } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalog,
  type PointCatalogItem,
} from '../api'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'

const rewardFormSchema = z.object({
  name: z.string().min(1, 'Nama reward wajib diisi'),
  description: z.string().optional(),
  costPoints: z.coerce.number().positive('Poin harus lebih dari 0'),
  validUntil: z.string().optional(),
})

export function CatalogCard({ disabled }: { disabled: boolean }) {
  const queryClient = useQueryClient()
  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ['admin-poin-katalog'],
    queryFn: listCatalog,
  })
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const form = useForm<
    z.input<typeof rewardFormSchema>,
    unknown,
    z.output<typeof rewardFormSchema>
  >({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: { name: '', description: '', costPoints: 0, validUntil: '' },
  })

  const createMutation = useMutation({
    mutationFn: (data: z.output<typeof rewardFormSchema>) =>
      createCatalogItem({
        name: data.name,
        description: data.description,
        cost_points: data.costPoints,
        valid_until: data.validUntil || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-poin-katalog'] })
      toast.success('Item katalog ditambahkan')
      setAddOpen(false)
      form.reset()
    },
    onError: handleServerError,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-poin-katalog'] })
      toast.success('Item katalog dihapus')
      setDeleteId(null)
    },
    onError: handleServerError,
  })

  const deleteTarget: PointCatalogItem | undefined = catalog.find(
    (c) => c.id === deleteId
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <CardTitle>Katalog Penukaran Poin</CardTitle>
            <CardDescription>
              Reward yang bisa ditukar anggota dengan KopPoin, beserta masa
              berlakunya.
            </CardDescription>
          </div>
          <Button size='sm' disabled={disabled} onClick={() => setAddOpen(true)}>
            <Plus className='size-4' /> Tambah Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Reward</TableHead>
                <TableHead>Biaya Poin</TableHead>
                <TableHead>Berlaku s.d.</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : catalog.length ? (
                catalog.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.cost_points.toLocaleString('id-ID')} poin</TableCell>
                    <TableCell>
                      {item.valid_until ? formatDate(item.valid_until) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={disabled}
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className='size-4' />
                        <span className='sr-only'>Hapus</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    Katalog masih kosong.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Item Katalog</DialogTitle>
            <DialogDescription>
              Item baru langsung tampil di aplikasi anggota.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='reward-form'
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Reward</FormLabel>
                    <FormControl>
                      <Input placeholder='cth. Diskon belanja Rp5.000' {...field} />
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
                      <Input placeholder='Opsional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='costPoints'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Poin</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
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
                  name='validUntil'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berlaku s.d.</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button form='reward-form' type='submit' disabled={createMutation.isPending}>
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          title='Hapus item katalog?'
          desc={`"${deleteTarget.name}" akan dihapus dari katalog penukaran.`}
          destructive
          confirmText='Hapus'
          cancelBtnText='Batal'
          handleConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </Card>
  )
}
