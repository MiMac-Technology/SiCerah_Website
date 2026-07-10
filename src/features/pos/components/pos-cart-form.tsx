import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { type z } from 'zod'
import { formatCurrency } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import { useTransactionsStore } from '@/stores/transactions-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { posFormSchema, type PosFormValues } from '../data/schema'
import { MemberCombobox } from './member-combobox'
import { usePos } from './pos-provider'
import { QrScanButton } from './qr-scan-button'

const NON_MEMBER_MARKUP = 1.08

const emptyValues: PosFormValues = {
  buyerType: 'anggota',
  memberId: undefined,
  buyerName: '',
  buyerPhone: '',
  items: [{ name: '', qty: 1, unitPriceMember: 0 }],
}

export function PosCartForm() {
  const { activeRole } = useRole()
  const addTransaction = useTransactionsStore((s) => s.addTransaction)
  const { setCurrentTransaction, setOpen } = usePos()

  const form = useForm<
    z.input<typeof posFormSchema>,
    unknown,
    z.output<typeof posFormSchema>
  >({
    resolver: zodResolver(posFormSchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const buyerType = form.watch('buyerType')
  const items = form.watch('items')
  const totalMember = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPriceMember) || 0),
    0
  )
  const totalNonMember = Math.round(totalMember * NON_MEMBER_MARKUP)

  const onSubmit = (data: PosFormValues) => {
    const transaction = addTransaction(
      {
        buyerType: data.buyerType,
        memberId: data.memberId,
        buyerName: data.buyerName || undefined,
        buyerPhone: data.buyerPhone || undefined,
        items: data.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          unitPriceMember: item.unitPriceMember,
          unitPriceNonMember: Math.round(
            item.unitPriceMember * NON_MEMBER_MARKUP
          ),
        })),
      },
      activeRole
    )
    toast.success(`Transaksi ${transaction.trxNo} berhasil dicatat`)
    setCurrentTransaction(transaction)
    setOpen('struk')
    form.reset(emptyValues)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='buyerType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifikasi Pembeli</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className='grid grid-cols-1 gap-2 sm:grid-cols-3'
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        form.setValue('memberId', undefined)
                        form.setValue('buyerName', '')
                        form.setValue('buyerPhone', '')
                      }}
                    >
                      <Label className='flex items-center gap-2 rounded-md border p-3 font-normal has-[[data-state=checked]]:border-primary'>
                        <RadioGroupItem value='anggota' /> Anggota
                      </Label>
                      <Label className='flex items-center gap-2 rounded-md border p-3 font-normal has-[[data-state=checked]]:border-primary'>
                        <RadioGroupItem value='non-anggota' /> Non-Anggota
                      </Label>
                      <Label className='flex items-center gap-2 rounded-md border p-3 font-normal has-[[data-state=checked]]:border-primary'>
                        <RadioGroupItem value='tanpa-ponsel' /> Warga Tanpa
                        Ponsel
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {buyerType === 'anggota' && (
              <FormField
                control={form.control}
                name='memberId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggota</FormLabel>
                    <div className='flex gap-2'>
                      <FormControl>
                        <MemberCombobox
                          value={field.value}
                          onSelect={(member) => field.onChange(member.id)}
                        />
                      </FormControl>
                      <QrScanButton
                        onScanned={(memberId) => field.onChange(memberId)}
                      />
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Scan QR kartu anggota atau cari via nama / no. anggota /
                      WA. Kontribusi (U&#7522;) dan KopPoin tercatat otomatis.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(buyerType === 'non-anggota' || buyerType === 'tanpa-ponsel') && (
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='buyerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pembeli</FormLabel>
                      <FormControl>
                        <Input placeholder='Nama warga' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {buyerType === 'non-anggota' && (
                  <FormField
                    control={form.control}
                    name='buyerPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder='08xxxxxxxxxx' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <Separator />

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label>Item Belanja</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ name: '', qty: 1, unitPriceMember: 0 })}
                >
                  <Plus className='size-4' /> Tambah Item
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='grid grid-cols-12 items-start gap-2'
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <FormItem className='col-span-6'>
                        <FormControl>
                          <Input placeholder='Nama item' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.qty`}
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormControl>
                          <Input
                            type='number'
                            min={1}
                            placeholder='Qty'
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
                    name={`items.${index}.unitPriceMember`}
                    render={({ field }) => (
                      <FormItem className='col-span-3'>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            placeholder='Harga anggota'
                            {...field}
                            value={field.value as string | number}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='col-span-1'
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className='grid gap-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Harga Anggota</span>
                <span className='font-medium'>{formatCurrency(totalMember)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Harga Non-Anggota</span>
                <span className='font-medium'>
                  {formatCurrency(totalNonMember)}
                </span>
              </div>
              <div className='flex justify-between text-base font-semibold'>
                <span>Total Ditagih</span>
                <span>
                  {formatCurrency(
                    buyerType === 'anggota' ? totalMember : totalNonMember
                  )}
                </span>
              </div>
            </div>

            <Button type='submit' className='w-full'>
              Proses Transaksi
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
