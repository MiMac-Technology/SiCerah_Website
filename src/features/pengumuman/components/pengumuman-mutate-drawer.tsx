import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRole } from '@/context/role-provider'
import {
  ANNOUNCEMENT_CATEGORIES,
  useAnnouncementsStore,
  type Announcement,
} from '@/stores/announcements-store'
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
import { Textarea } from '@/components/ui/textarea'
import { PhotoUploadField } from '@/components/photo-upload-field'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  announcementFormSchema,
  type AnnouncementFormValues,
} from '../data/schema'

type PengumumanMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Announcement
}

export function PengumumanMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PengumumanMutateDrawerProps) {
  const { activeRole } = useRole()
  const createAnnouncement = useAnnouncementsStore((s) => s.createAnnouncement)
  const updateAnnouncement = useAnnouncementsStore((s) => s.updateAnnouncement)
  const isUpdate = !!currentRow

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: currentRow
      ? {
          title: currentRow.title,
          content: currentRow.content,
          category: currentRow.category,
          photoDataUrl: currentRow.photoDataUrl,
          channel: currentRow.channel ?? 'in-app',
          scheduledAt: currentRow.scheduledAt
            ? currentRow.scheduledAt.slice(0, 16)
            : undefined,
        }
      : {
          title: '',
          content: '',
          category: 'Umum',
          photoDataUrl: undefined,
          channel: 'keduanya',
          scheduledAt: undefined,
        },
  })

  const onSubmit = (data: AnnouncementFormValues) => {
    const payload = {
      ...data,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt).toISOString()
        : undefined,
    }
    const isScheduled =
      !!payload.scheduledAt && new Date(payload.scheduledAt) > new Date()
    if (currentRow) {
      updateAnnouncement(currentRow.id, payload, activeRole)
      toast.success('Pengumuman berhasil diperbarui.')
    } else {
      createAnnouncement(payload, activeRole)
      toast.success(
        isScheduled
          ? 'Pengumuman dijadwalkan — akan terkirim otomatis sesuai jadwal.'
          : 'Pengumuman berhasil dibuat.'
      )
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
          <SheetTitle>{isUpdate ? 'Ubah Pengumuman' : 'Buat Pengumuman'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Perbarui detail pengumuman lalu simpan perubahan.'
              : 'Isi detail pengumuman baru untuk dipublikasikan ke anggota.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pengumuman-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder='Judul pengumuman' {...field} />
                  </FormControl>
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
                    items={ANNOUNCEMENT_CATEGORIES.map((c) => ({
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
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Isi Pengumuman</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder='Tulis isi pengumuman di sini...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='channel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Pengiriman</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Pilih channel'
                    items={[
                      { label: 'Notif In-App', value: 'in-app' },
                      { label: 'WA Blast', value: 'wa' },
                      { label: 'Keduanya (In-App + WA)', value: 'keduanya' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='scheduledAt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jadwalkan Pengiriman (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type='datetime-local'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <p className='text-xs text-muted-foreground'>
                    Kosongkan untuk kirim langsung saat disimpan.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='photoDataUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lampiran Foto (opsional)</FormLabel>
                  <PhotoUploadField
                    value={field.value}
                    onChange={field.onChange}
                    description='PNG atau JPG'
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
          <Button form='pengumuman-form' type='submit'>
            Simpan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
