import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { handleServerError } from '@/lib/handle-server-error'
import {
  getCooperativeProfile,
  resolveLogoUrl,
  updateCooperativeProfile,
} from './api'

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nama koperasi wajib diisi'),
  villageAddress: z.string().min(1, 'Alamat desa wajib diisi'),
  legalNumber: z.string().optional(),
  logoDataUrl: z.string().optional(),
  fonnteNumber: z.string().optional(),
  announcementThreshold: z.coerce.number().min(0, 'Wajib diisi'),
  memberApprovalThreshold: z.coerce.number().min(0, 'Wajib diisi'),
  approvalQuorumPct: z.coerce.number().min(0).max(100, 'Maksimal 100%'),
  initialCashBalance: z.coerce.number().min(0, 'Wajib diisi'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const emptyDefaults: ProfileFormValues = {
  name: '',
  villageAddress: '',
  legalNumber: '',
  logoDataUrl: undefined,
  fonnteNumber: '',
  announcementThreshold: 500000,
  memberApprovalThreshold: 1000000,
  approvalQuorumPct: 50,
  initialCashBalance: 0,
}

export function AdminProfil() {
  const { activeRole, hasAccess } = useRoleAccess(['admin'])
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-pengaturan-koperasi'],
    queryFn: getCooperativeProfile,
  })

  const form = useForm<
    z.input<typeof profileFormSchema>,
    unknown,
    z.output<typeof profileFormSchema>
  >({
    resolver: zodResolver(profileFormSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      name: profile.nama,
      villageAddress: profile.alamat,
      legalNumber: profile.nomor_badan_hukum ?? '',
      logoDataUrl: resolveLogoUrl(profile),
      fonnteNumber: profile.wa_bot_number ?? '',
      announcementThreshold: Number(profile.announcement_threshold),
      memberApprovalThreshold: Number(profile.member_approval_threshold),
      approvalQuorumPct: Number(profile.approval_quorum_pct),
      initialCashBalance: Number(profile.initial_cash_balance),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      updateCooperativeProfile({
        nama: data.name,
        alamat: data.villageAddress,
        nomorBadanHukum: data.legalNumber,
        logoDataUrl: data.logoDataUrl,
        waBotNumber: data.fonnteNumber,
        announcementThreshold: data.announcementThreshold,
        memberApprovalThreshold: data.memberApprovalThreshold,
        approvalQuorumPct: data.approvalQuorumPct,
        initialCashBalance: data.initialCashBalance,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pengaturan-koperasi'] })
      toast.success('Profil koperasi berhasil disimpan')
    },
    onError: handleServerError,
  })

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data)
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
              {isLoading
                ? 'Memuat data...'
                : profile
                  ? `Terakhir diperbarui ${new Date(profile.updated_at).toLocaleString('id-ID')}`
                  : 'Belum ada pengaturan tersimpan — isi form di bawah untuk membuat.'}
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
                  <FormField
                    control={form.control}
                    name='announcementThreshold'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambang Auto-Announce (Rp)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormDescription>
                          Pengeluaran di atas nominal ini otomatis dibuatkan
                          pengumuman berbukti ke semua anggota.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='memberApprovalThreshold'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambang Vote Anggota (Rp)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormDescription>
                          Pengeluaran di atas nominal ini butuh persetujuan
                          vote anggota ("RAT mini") sebelum dieksekusi.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='approvalQuorumPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kuorum Persetujuan (%)</FormLabel>
                        <FormControl>
                          <Input type='number' min={0} max={100} {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormDescription>
                          Persentase suara setuju minimum agar vote
                          pengeluaran dinyatakan sah.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='initialCashBalance'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Kas Awal / C₀ (Rp)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormDescription>
                          Tidak bisa diubah lagi setelah ada transaksi kas
                          tercatat.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='submit'
                    disabled={!hasAccess || mutation.isPending}
                  >
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
