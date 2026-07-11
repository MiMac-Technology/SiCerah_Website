import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type z } from 'zod'
import { handleServerError } from '@/lib/handle-server-error'
import { updateShuParameter, type FiscalYear } from '../api'
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
import { shuConfigFormSchema } from '../data/schema'

type ShuConfigFormProps = {
  fiscalYear: FiscalYear
  disabled?: boolean
}

export function ShuConfigForm({ fiscalYear, disabled }: ShuConfigFormProps) {
  const queryClient = useQueryClient()
  const param = fiscalYear.shu_parameter

  const form = useForm<
    z.input<typeof shuConfigFormSchema>,
    unknown,
    z.output<typeof shuConfigFormSchema>
  >({
    resolver: zodResolver(shuConfigFormSchema),
    defaultValues: {
      jasaModalPct: param ? Number(param.pct_jasa_modal) : 50,
      jasaUsahaPct: param ? Number(param.pct_jasa_usaha) : 50,
      cadanganPct: param ? Number(param.pct_dana_cadangan) : 25,
      porsiAnggotaPct: param ? Number(param.pct_porsi_anggota) : 50,
      danaPengurusPct: param ? Number(param.pct_jasa_pengurus) : 15,
      danaLainPct: param ? Number(param.pct_dana_lain) : 10,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: z.output<typeof shuConfigFormSchema>) =>
      updateShuParameter(fiscalYear.id, {
        pct_jasa_modal: data.jasaModalPct,
        pct_jasa_usaha: data.jasaUsahaPct,
        pct_dana_cadangan: data.cadanganPct,
        pct_porsi_anggota: data.porsiAnggotaPct,
        pct_jasa_pengurus: data.danaPengurusPct,
        pct_dana_lain: data.danaLainPct,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tahun-buku'] })
      toast.success('Parameter SHU berhasil disimpan')
    },
    onError: handleServerError,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameter SHU — {fiscalYear.name}</CardTitle>
        <CardDescription>
          Jasa Modal + Jasa Usaha harus = 100%. Cadangan + Porsi Anggota + Dana
          Pengurus + Dana Lain juga harus = 100%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <fieldset disabled={disabled} className='contents'>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className='space-y-6'
            >
              <div>
                <FormLabel>Jasa Modal vs Jasa Usaha (harus = 100%)</FormLabel>
                <div className='mt-2 grid gap-4 sm:grid-cols-2'>
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
                </div>
              </div>

              <div>
                <FormLabel>Alokasi Laba Berjalan (harus = 100%)</FormLabel>
                <div className='mt-2 grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='cadanganPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Cadangan (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='porsiAnggotaPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porsi Anggota (%)</FormLabel>
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
                        <FormLabel>Jasa Pengurus (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='danaLainPct'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Lain (%)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type='submit' disabled={disabled || mutation.isPending}>
                Simpan Parameter
              </Button>
            </form>
          </fieldset>
        </Form>
      </CardContent>
    </Card>
  )
}
