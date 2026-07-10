import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { useKopPoinConfigStore } from '@/stores/koppoin-config-store'
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

const ratesFormSchema = z.object({
  belanjaPer10k: z.coerce.number().min(0),
  simpananPer10k: z.coerce.number().min(0),
  setorPanenPer10k: z.coerce.number().min(0),
  kehadiranRapat: z.coerce.number().min(0),
})

export function RatesForm({ disabled }: { disabled: boolean }) {
  const rates = useKopPoinConfigStore((s) => s.rates)
  const updateRates = useKopPoinConfigStore((s) => s.updateRates)

  const form = useForm<
    z.input<typeof ratesFormSchema>,
    unknown,
    z.output<typeof ratesFormSchema>
  >({
    resolver: zodResolver(ratesFormSchema),
    defaultValues: rates,
  })

  const onSubmit = (data: z.output<typeof ratesFormSchema>) => {
    updateRates(data)
    toast.success('Rate konversi KopPoin disimpan')
  }

  const fields = [
    {
      name: 'belanjaPer10k' as const,
      label: 'Belanja',
      desc: 'Poin per Rp10.000 belanja di toko koperasi.',
    },
    {
      name: 'simpananPer10k' as const,
      label: 'Simpanan',
      desc: 'Poin per Rp10.000 setoran simpanan.',
    },
    {
      name: 'setorPanenPer10k' as const,
      label: 'Setor Panen',
      desc: 'Poin per Rp10.000 nilai panen yang disetor.',
    },
    {
      name: 'kehadiranRapat' as const,
      label: 'Kehadiran Rapat',
      desc: 'Poin per kehadiran rapat anggota.',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Konversi Poin</CardTitle>
        <CardDescription>
          Tentukan berapa KopPoin yang didapat anggota dari tiap aktivitas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <fieldset disabled={disabled} className='contents'>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                {fields.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.label}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value as string | number}
                          />
                        </FormControl>
                        <FormDescription>{f.desc}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type='submit' disabled={disabled}>
                Simpan Rate
              </Button>
            </form>
          </fieldset>
        </Form>
      </CardContent>
    </Card>
  )
}
