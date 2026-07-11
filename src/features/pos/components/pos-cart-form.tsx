import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type z } from 'zod'
import { formatCurrency } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
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
import { createSale, type Product } from '../api'
import { posFormSchema, type PosFormValues } from '../data/schema'
import { MemberCombobox } from './member-combobox'
import { usePos } from './pos-provider'
import { ProductCombobox } from './product-combobox'
import { QrScanButton } from './qr-scan-button'

const emptyValues: PosFormValues = {
  buyerType: 'anggota',
  memberId: undefined,
  buyerName: '',
  buyerPhone: '',
  items: [
    { productId: 0, name: '', qty: 1, unitPriceMember: 0, unitPriceNonMember: 0 },
  ],
}

export function PosCartForm() {
  const queryClient = useQueryClient()
  const { setCurrentTransaction, setOpen } = usePos()
  const [memberLabel, setMemberLabel] = useState<string>()
  const [itemLabels, setItemLabels] = useState<Record<string, string>>({})

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
    (sum, item) =>
      sum + (Number(item.qty) || 0) * (Number(item.unitPriceMember) || 0),
    0
  )
  const totalNonMember = items.reduce(
    (sum, item) =>
      sum + (Number(item.qty) || 0) * (Number(item.unitPriceNonMember) || 0),
    0
  )

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'penjualan'] })
      toast.success(`Transaksi ${sale.trxNo} berhasil dicatat`)
      setCurrentTransaction(sale)
      setOpen('struk')
      form.reset(emptyValues)
      setMemberLabel(undefined)
      setItemLabels({})
    },
    onError: handleServerError,
  })

  const selectProduct = (index: number, fieldId: string, product: Product) => {
    form.setValue(`items.${index}.productId`, product.id)
    form.setValue(`items.${index}.name`, product.name)
    form.setValue(
      `items.${index}.unitPriceMember`,
      product.memberPrice ?? product.price
    )
    form.setValue(`items.${index}.unitPriceNonMember`, product.price)
    setItemLabels((prev) => ({ ...prev, [fieldId]: product.name }))
  }

  const removeItem = (index: number) => {
    const fieldId = fields[index].id
    remove(index)
    setItemLabels((prev) => {
      const rest = { ...prev }
      delete rest[fieldId]
      return rest
    })
  }

  const onSubmit = (data: PosFormValues) => {
    createSaleMutation.mutate({
      items: data.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      })),
      buyerType: data.buyerType,
      memberId: data.memberId,
      buyerName: data.buyerName || undefined,
      customerWa: data.buyerPhone || undefined,
    })
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
                        setMemberLabel(undefined)
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
                          value={field.value as number | undefined}
                          label={memberLabel}
                          onSelect={(member) => {
                            field.onChange(member.id)
                            setMemberLabel(`${member.name} — ${member.memberNo}`)
                          }}
                        />
                      </FormControl>
                      <QrScanButton
                        onScanned={(member) => {
                          field.onChange(member.id)
                          setMemberLabel(`${member.name} — ${member.memberNo}`)
                        }}
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
                  onClick={() =>
                    append({
                      productId: 0,
                      name: '',
                      qty: 1,
                      unitPriceMember: 0,
                      unitPriceNonMember: 0,
                    })
                  }
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
                    name={`items.${index}.productId`}
                    render={({ field: productField }) => (
                      <FormItem className='col-span-7'>
                        <FormControl>
                          <ProductCombobox
                            value={
                              (productField.value as number | undefined) ||
                              undefined
                            }
                            label={itemLabels[field.id]}
                            onSelect={(product) =>
                              selectProduct(index, field.id, product)
                            }
                          />
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
                  <div className='col-span-2 flex h-9 items-center justify-end text-sm text-muted-foreground'>
                    {formatCurrency(
                      buyerType === 'anggota'
                        ? Number(form.watch(`items.${index}.unitPriceMember`)) || 0
                        : Number(form.watch(`items.${index}.unitPriceNonMember`)) || 0
                    )}
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='col-span-1'
                    disabled={fields.length === 1}
                    onClick={() => removeItem(index)}
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

            <Button
              type='submit'
              className='w-full'
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? 'Memproses...' : 'Proses Transaksi'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
