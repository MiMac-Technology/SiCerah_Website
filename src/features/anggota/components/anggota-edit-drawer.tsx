import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRole } from '@/context/role-provider'
import { type Member, useMembersStore } from '@/stores/members-store'
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DatePicker } from '@/components/date-picker'
import { editMemberFormSchema, type EditMemberFormValues } from '../data/schema'

type AnggotaEditDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Member
}

export function AnggotaEditDrawer({
  open,
  onOpenChange,
  currentRow,
}: AnggotaEditDrawerProps) {
  const { activeRole } = useRole()
  const updateMemberProfile = useMembersStore((s) => s.updateMemberProfile)

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberFormSchema),
    defaultValues: {
      fullName: currentRow.fullName,
      nik: currentRow.nik,
      address: currentRow.address,
      domicileAddress: currentRow.domicileAddress ?? '',
      birthDate: currentRow.birthDate,
    },
  })

  const onSubmit = (data: EditMemberFormValues) => {
    updateMemberProfile(currentRow.id, data, activeRole)
    toast.success('Data anggota berhasil diperbarui')
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='text-start'>
          <SheetTitle>Ubah Data Anggota</SheetTitle>
          <SheetDescription>
            Perbarui data KTP dan domisili anggota {currentRow.fullName}.
          </SheetDescription>
        </SheetHeader>
        <div className='px-4'>
          <p className='rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground'>
            No. WhatsApp (terkunci): {currentRow.phone}
          </p>
        </div>
        <Form {...form}>
          <form
            id='anggota-edit-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-4 py-2'
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder='Sesuai KTP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='nik'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input
                      inputMode='numeric'
                      maxLength={16}
                      placeholder='16 digit NIK'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='birthDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <DatePicker
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(d) => field.onChange(d?.toISOString() ?? '')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat KTP</FormLabel>
                  <FormControl>
                    <Input placeholder='Alamat sesuai KTP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='domicileAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Domisili (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Isi jika berbeda dari alamat KTP'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <Button form='anggota-edit-form' type='submit'>
            Simpan Perubahan
          </Button>
          <SheetClose asChild>
            <Button variant='outline'>Batal</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
