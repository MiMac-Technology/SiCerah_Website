import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { formatDate } from '@/lib/format'
import {
  useKopPoinConfigStore,
  type RewardType,
} from '@/stores/koppoin-config-store'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SelectDropdown } from '@/components/select-dropdown'
import { ConfirmDialog } from '@/components/confirm-dialog'

const REWARD_TYPES: RewardType[] = [
  'Diskon Belanja',
  'Potongan Simpanan',
  'Potongan Jasa Pinjaman',
]

const rewardFormSchema = z.object({
  name: z.string().min(1, 'Nama reward wajib diisi'),
  type: z.enum(['Diskon Belanja', 'Potongan Simpanan', 'Potongan Jasa Pinjaman']),
  pointCost: z.coerce.number().positive('Poin harus lebih dari 0'),
  validUntil: z.string().min(1, 'Masa berlaku wajib diisi'),
})

export function CatalogCard({ disabled }: { disabled: boolean }) {
  const catalog = useKopPoinConfigStore((s) => s.catalog)
  const addRewardItem = useKopPoinConfigStore((s) => s.addRewardItem)
  const deleteRewardItem = useKopPoinConfigStore((s) => s.deleteRewardItem)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<
    z.input<typeof rewardFormSchema>,
    unknown,
    z.output<typeof rewardFormSchema>
  >({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: {
      name: '',
      type: 'Diskon Belanja',
      pointCost: 0,
      validUntil: '',
    },
  })

  const onSubmit = (data: z.output<typeof rewardFormSchema>) => {
    addRewardItem({
      ...data,
      validUntil: new Date(data.validUntil).toISOString(),
    })
    toast.success('Item katalog ditambahkan')
    setAddOpen(false)
    form.reset()
  }

  const deleteTarget = catalog.find((c) => c.id === deleteId)

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
          <Button
            size='sm'
            disabled={disabled}
            onClick={() => setAddOpen(true)}
          >
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
                <TableHead>Jenis</TableHead>
                <TableHead>Biaya Poin</TableHead>
                <TableHead>Berlaku s.d.</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.length ? (
                catalog.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{item.type}</Badge>
                    </TableCell>
                    <TableCell>{item.pointCost.toLocaleString('id-ID')} poin</TableCell>
                    <TableCell>{formatDate(item.validUntil)}</TableCell>
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
                  <TableCell colSpan={5} className='h-24 text-center'>
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
              onSubmit={form.handleSubmit(onSubmit)}
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
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      items={REWARD_TYPES.map((t) => ({ label: t, value: t }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='pointCost'
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
            <Button form='reward-form' type='submit'>
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
          handleConfirm={() => {
            deleteRewardItem(deleteTarget.id)
            setDeleteId(null)
          }}
        />
      )}
    </Card>
  )
}
