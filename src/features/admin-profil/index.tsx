import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PhotoUploadField } from '@/components/photo-upload-field'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useKoperasiProfileStore } from '@/stores/koperasi-profile-store'

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nama koperasi wajib diisi'),
  villageAddress: z.string().min(1, 'Alamat desa wajib diisi'),
  legalNumber: z.string().min(1, 'Nomor badan hukum wajib diisi'),
  logoDataUrl: z.string().optional(),
  fonnteNumber: z.string().min(9, 'Nomor WhatsApp bot Fonnte wajib diisi'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function AdminProfil() {
  const { activeRole, hasAccess } = useRoleAccess(['admin'])
  const profile = useKoperasiProfileStore((s) => s.profile)
  const updateProfile = useKoperasiProfileStore((s) => s.updateProfile)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      villageAddress: profile.villageAddress,
      legalNumber: profile.legalNumber,
      logoDataUrl: profile.logoDataUrl,
      fonnteNumber: profile.fonnteNumber,
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data)
    toast.success('Profil koperasi berhasil disimpan')
  }

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Pengaturan Profil Koperasi
          </h2>
          <p className='text-muted-foreground'>
            Data dasar koperasi yang tampil di aplikasi anggota dan struk.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Card className='max-w-2xl'>
          <CardHeader>
            <CardTitle>Identitas Koperasi</CardTitle>
            <CardDescription>
              Terakhir diperbarui{' '}
              {new Date(profile.updatedAt).toLocaleString('id-ID')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <fieldset disabled={!hasAccess} className='contents'>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='logoDataUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo Koperasi</FormLabel>
                        <FormControl>
                          <PhotoUploadField
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!hasAccess}
                            description='Logo tampil di aplikasi anggota dan struk WA.'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Koperasi</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='villageAddress'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Desa</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='legalNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Badan Hukum</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='fonnteNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor WhatsApp Bot (Fonnte)</FormLabel>
                        <FormControl>
                          <Input placeholder='08xxxxxxxxxx' {...field} />
                        </FormControl>
                        <FormDescription>
                          Nomor ini dipakai bot Fonnte untuk mengirim struk dan
                          pesan verifikasi transaksi.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={!hasAccess}>
                    Simpan Profil
                  </Button>
                </form>
              </fieldset>
            </Form>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
