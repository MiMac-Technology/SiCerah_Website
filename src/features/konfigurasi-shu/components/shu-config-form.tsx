import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { type z } from 'zod'
import { formatCurrency } from '@/lib/format'
import { ROLE_LABELS } from '@/config/roles'
import { useRole } from '@/context/role-provider'
import { useShuConfigStore } from '@/stores/shu-config-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { shuConfigFormSchema } from '../data/schema'

type ShuConfigFormProps = {
  disabled?: boolean
}

export function ShuConfigForm({ disabled }: ShuConfigFormProps) {
  const { activeRole } = useRole()
  const config = useShuConfigStore((s) => s.config)
  const updateConfig = useShuConfigStore((s) => s.updateConfig)

  const form = useForm<
    z.input<typeof shuConfigFormSchema>,
    unknown,
    z.output<typeof shuConfigFormSchema>
  >({
    resolver: zodResolver(shuConfigFormSchema),
    defaultValues: {
      koperasiName: config.koperasiName,
      fiscalYear: config.fiscalYear,
      jasaModalPct: config.jasaModalPct,
      jasaUsahaPct: config.jasaUsahaPct,
      cadanganPct: config.cadanganPct,
      danaSosialPct: config.danaSosialPct,
      danaPengurusPct: config.danaPengurusPct,
      approvalThreshold: config.approvalThreshold,
    },
  })

  const onSubmit = (data: z.output<typeof shuConfigFormSchema>) => {
    updateConfig(data, ROLE_LABELS[activeRole])
    toast.success('Parameter SHU/AD-ART berhasil diperbarui')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter SHU / AD-ART</CardTitle>
        <CardDescription>
          Terakhir diperbarui oleh {config.updatedBy} —{' '}
          {new Date(config.updatedAt).toLocaleString('id-ID')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <fieldset disabled={disabled} className='contents'>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='koperasiName'
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
                  name='fiscalYear'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Buku</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} value={field.value as string | number} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Alokasi Sisa Hasil Usaha (SHU)</FormLabel>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Total kelima persentase di bawah ini tidak boleh melebihi 100%.
                </p>
                <div className='grid gap-4 sm:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='jasaModalPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jasa Modal (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='jasaUsahaPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jasa Usaha (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='cadanganPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cadangan (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='danaSosialPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Sosial (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='danaPengurusPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Pengurus (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name='approvalThreshold'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ambang Batas Approval Pengeluaran</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} value={field.value as string | number} />
                    </FormControl>
                    <FormDescription>
                      Pengeluaran di atas {formatCurrency(Number(field.value) || 0)}{' '}
                      akan otomatis melalui Approval Center.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={disabled}>
                Simpan Parameter
              </Button>
            </form>
          </fieldset>
        </Form>
      </CardContent>
    </Card>
  )
}
