import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type z } from 'zod'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRoleAccess } from '@/hooks/use-role-access'
import { handleServerError } from '@/lib/handle-server-error'
import { createFiscalYear, listFiscalYears } from './api'
import { ParameterLockCard } from './components/parameter-lock-card'
import { ShuConfigForm } from './components/shu-config-form'
import { fiscalYearFormSchema } from './data/schema'

function NewFiscalYearCard({ disabled }: { disabled: boolean }) {
  const queryClient = useQueryClient()
  const form = useForm<
    z.input<typeof fiscalYearFormSchema>,
    unknown,
    z.output<typeof fiscalYearFormSchema>
  >({
    resolver: zodResolver(fiscalYearFormSchema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: z.output<typeof fiscalYearFormSchema>) =>
      createFiscalYear({
        name: data.name,
        start_date: data.startDate,
        end_date: data.endDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tahun-buku'] })
      toast.success('Tahun buku baru dibuat')
      form.reset()
    },
    onError: handleServerError,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Tahun Buku</CardTitle>
        <CardDescription>
          Belum ada tahun buku aktif (open). Buat satu untuk mulai mengatur
          parameter SHU.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <fieldset disabled={disabled} className='contents'>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Tahun Buku</FormLabel>
                    <FormControl>
                      <Input placeholder='cth. Tahun Buku 2026' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' disabled={disabled || mutation.isPending}>
                Buat Tahun Buku
              </Button>
            </form>
          </fieldset>
        </Form>
      </CardContent>
    </Card>
  )
}

export function KonfigurasiShu() {
  const { activeRole, hasAccess } = useRoleAccess(['bendahara', 'ketua'])
  const { data: fiscalYears = [], isLoading } = useQuery({
    queryKey: ['admin-tahun-buku'],
    queryFn: listFiscalYears,
  })

  const currentFiscalYear = fiscalYears.find((fy) => fy.status === 'open')
  const locked = currentFiscalYear?.shu_parameter?.is_locked ?? false

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
            Konfigurasi Parameter SHU
          </h2>
          <p className='text-muted-foreground'>
            Sesuaikan parameter SHU dan periode tahun buku koperasi ini.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-6'>
          {isLoading ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              Memuat data...
            </p>
          ) : currentFiscalYear ? (
            <>
              <ParameterLockCard
                fiscalYear={currentFiscalYear}
                isKetua={activeRole === 'ketua'}
              />
              <ShuConfigForm
                fiscalYear={currentFiscalYear}
                disabled={!hasAccess || locked}
              />
            </>
          ) : (
            <NewFiscalYearCard disabled={!hasAccess} />
          )}
        </div>
      </Main>
    </>
  )
}
