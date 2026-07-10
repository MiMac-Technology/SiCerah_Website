import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { STAFF_ROLES, STAFF_ROLE_LABELS } from '@/config/roles'
import { useAccountsStore, type StaffAccount } from '@/stores/accounts-store'
import { Button } from '@/components/ui/button'
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  staffAccountFormSchema,
  type StaffAccountFormValues,
} from '../data/schema'

type AkunMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: StaffAccount
}

export function AkunMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: AkunMutateDrawerProps) {
  const isUpdate = !!currentRow
  const createAccount = useAccountsStore((s) => s.createAccount)
  const updateAccount = useAccountsStore((s) => s.updateAccount)

  const form = useForm<StaffAccountFormValues>({
    resolver: zodResolver(staffAccountFormSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          email: currentRow.email,
          phone: currentRow.phone,
          role: currentRow.role,
        }
      : { name: '', email: '', phone: '', role: 'kasir' },
  })

  const onSubmit = (data: StaffAccountFormValues) => {
    if (isUpdate) {
      updateAccount(currentRow.id, data)
      toast.success('Akun pengurus diperbarui')
    } else {
      createAccount(data)
      toast.success('Akun pengurus dibuat')
    }
    onOpenChange(false)
    form.reset()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isUpdate ? 'Edit Akun Pengurus' : 'Buat Akun Pengurus'}
          </SheetTitle>
          <SheetDescription>
            Akun ini menentukan hak akses (RBAC) di aplikasi pengurus.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='akun-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder='Nama pengurus' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='email@koperasi.id' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
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
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Pilih role'
                    items={STAFF_ROLES.map((role) => ({
                      label: STAFF_ROLE_LABELS[role],
                      value: role,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button form='akun-form' type='submit'>
            {isUpdate ? 'Simpan Perubahan' : 'Buat Akun'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
