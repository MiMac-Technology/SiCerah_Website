import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRole } from '@/context/role-provider'
import { EXPENSE_CATEGORIES, useExpensesStore } from '@/stores/expenses-store'
import { useShuConfigStore } from '@/stores/shu-config-store'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { PhotoUploadField } from '@/components/photo-upload-field'
import { SelectDropdown } from '@/components/select-dropdown'
import { z } from 'zod'
import { expenseFormSchema, type ExpenseFormValues } from '../data/schema'

type ExpenseFormInput = z.input<typeof expenseFormSchema>

type KasKeluarMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KasKeluarMutateDrawer({
  open,
  onOpenChange,
}: KasKeluarMutateDrawerProps) {
  const { activeRole } = useRole()
  const addExpense = useExpensesStore((s) => s.addExpense)
  const approvalThreshold = useShuConfigStore(
    (s) => s.config.approvalThreshold
  )

  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: '',
      category: 'Operasional',
      description: '',
      amount: 0,
      proofPhotoDataUrl: '',
    },
  })

  const onSubmit = (data: ExpenseFormValues) => {
    const expense = addExpense(data, activeRole)
    if (expense.requiresApproval) {
      toast.info(
        'Pengeluaran melebihi ambang batas — dikirim ke Approval Center'
      )
    } else {
      toast.success('Pengeluaran dicatat, menunggu verifikasi')
    }
    onOpenChange(false)
    form.reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>Catat Pengeluaran</SheetTitle>
          <SheetDescription>
            Isi detail pengeluaran kas beserta bukti foto kwitansi.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='kas-keluar-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Tanggal</FormLabel>
                  <DatePicker
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(d) => field.onChange(d?.toISOString() ?? '')}
                    placeholder='Pilih tanggal'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Pilih kategori'
                    items={EXPENSE_CATEGORIES.map((c) => ({
                      label: c,
                      value: c,
                    }))}
                  />
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
                    <Textarea
                      rows={4}
                      placeholder='Jelaskan tujuan pengeluaran ini...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      step='1'
                      placeholder='0'
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      value={(field.value as number | string | undefined) ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <p className='text-xs text-muted-foreground'>
                    Pengeluaran di atas {formatCurrency(approvalThreshold)}{' '}
                    akan otomatis melalui Approval Center.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='proofPhotoDataUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bukti Foto Kwitansi</FormLabel>
                  <PhotoUploadField
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                    description='Wajib diunggah — PNG atau JPG'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Batal</Button>
          </SheetClose>
          <Button form='kas-keluar-form' type='submit'>
            Simpan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
