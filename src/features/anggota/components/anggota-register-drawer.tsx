import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRole } from '@/context/role-provider'
import { useMembersStore } from '@/stores/members-store'
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
import { PhotoUploadField } from '@/components/photo-upload-field'
import {
  registerMemberFormSchema,
  type RegisterMemberFormValues,
} from '../data/schema'

type AnggotaRegisterDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultValues: RegisterMemberFormValues = {
  fullName: '',
  nik: '',
  address: '',
  domicileAddress: '',
  phone: '',
  birthDate: '',
  ktpPhotoDataUrl: '',
}

export function AnggotaRegisterDrawer({
  open,
  onOpenChange,
}: AnggotaRegisterDrawerProps) {
  const { activeRole } = useRole()
  const registerMember = useMembersStore((s) => s.registerMember)

  const form = useForm<RegisterMemberFormValues>({
    resolver: zodResolver(registerMemberFormSchema),
    defaultValues,
  })

  const onSubmit = (data: RegisterMemberFormValues) => {
    registerMember(data, activeRole)
    toast.success('Anggota berhasil diregistrasi')
    onOpenChange(false)
    form.reset(defaultValues)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset(defaultValues)
      }}
    >
      <SheetContent className='flex flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='text-start'>
          <SheetTitle>Registrasi Anggota Baru</SheetTitle>
          <SheetDescription>
            Lengkapi data KTP dan domisili calon anggota. Nomor WhatsApp akan
            terkunci setelah registrasi dan tidak dapat diubah.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='anggota-register-form'
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
            <FormField
              control={form.control}
              name='ktpPhotoDataUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto KTP</FormLabel>
                  <FormControl>
                    <PhotoUploadField
                      value={field.value}
                      onChange={(dataUrl) => field.onChange(dataUrl ?? '')}
                      description='Wajib diunggah untuk verifikasi identitas.'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <Button form='anggota-register-form' type='submit'>
            Registrasi
          </Button>
          <SheetClose asChild>
            <Button variant='outline'>Batal</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
