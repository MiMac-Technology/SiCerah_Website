import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { STAFF_ROLES, STAFF_ROLE_LABELS } from '@/config/roles'
import { handleServerError } from '@/lib/handle-server-error'
import { createAccount, updateAccount, type StaffAccount } from '../api'
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
import { PasswordInput } from '@/components/password-input'
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
  createStaffAccountFormSchema,
  updateStaffAccountFormSchema,
  type CreateStaffAccountFormValues,
  type UpdateStaffAccountFormValues,
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
  const queryClient = useQueryClient()

  const form = useForm<
    CreateStaffAccountFormValues | UpdateStaffAccountFormValues
  >({
    resolver: zodResolver(
      isUpdate ? updateStaffAccountFormSchema : createStaffAccountFormSchema
    ),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          email: currentRow.email,
          phone: currentRow.phone,
          nik: currentRow.nik,
          alamat: currentRow.alamat,
          role: currentRow.role,
        }
      : {
          name: '',
          email: '',
          phone: '',
          nik: '',
          alamat: '',
          role: 'kasir',
          password: '',
        },
  })

  const mutation = useMutation({
    mutationFn: (data: CreateStaffAccountFormValues | UpdateStaffAccountFormValues) =>
      isUpdate
        ? updateAccount(currentRow.id, data)
        : createAccount(data as CreateStaffAccountFormValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-akun'] })
      toast.success(isUpdate ? 'Akun pengurus diperbarui' : 'Akun pengurus dibuat')
      onOpenChange(false)
      form.reset()
    },
    onError: handleServerError,
  })

  const onSubmit = (
    data: CreateStaffAccountFormValues | UpdateStaffAccountFormValues
  ) => {
    mutation.mutate(data)
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
            {!isUpdate && (
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='Minimal 8 karakter' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name='nik'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input placeholder='16 digit NIK' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='alamat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder='Alamat lengkap' {...field} />
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
          <Button form='akun-form' type='submit' disabled={mutation.isPending}>
            {isUpdate ? 'Simpan Perubahan' : 'Buat Akun'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
