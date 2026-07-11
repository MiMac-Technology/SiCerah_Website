import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { handleServerError } from '@/lib/handle-server-error'
import { listPointRules, updatePointRule, type PointRule } from '../api'
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

const ACTIVITY_LABELS: Record<PointRule['activity'], string> = {
  belanja: 'Belanja',
  simpanan: 'Simpanan',
  setor_panen: 'Setor Panen',
  bayar_cicilan: 'Bayar Cicilan',
  hadir_rapat: 'Kehadiran Rapat',
}

const ruleFormSchema = z.object({
  points: z.coerce.number().min(0, 'Wajib diisi'),
  perAmount: z.coerce.number().positive('Harus lebih dari 0').optional(),
})

function RuleRow({ rule, disabled }: { rule: PointRule; disabled: boolean }) {
  const queryClient = useQueryClient()

  const form = useForm<
    z.input<typeof ruleFormSchema>,
    unknown,
    z.output<typeof ruleFormSchema>
  >({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      points: rule.points,
      perAmount: rule.per_amount ? Number(rule.per_amount) : undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: z.output<typeof ruleFormSchema>) =>
      updatePointRule(rule.id, {
        points: data.points,
        per_amount: data.perAmount ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-poin-rules'] })
      toast.success(`Rate ${ACTIVITY_LABELS[rule.activity]} disimpan`)
    },
    onError: handleServerError,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className='grid items-end gap-3 border-b py-4 last:border-0 sm:grid-cols-[1fr_1fr_1fr_auto]'
      >
        <div>
          <p className='text-sm font-medium'>{ACTIVITY_LABELS[rule.activity]}</p>
          <p className='text-muted-foreground text-xs'>{rule.description}</p>
        </div>
        <FormField
          control={form.control}
          name='points'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poin</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  disabled={disabled}
                  {...field}
                  value={field.value as string | number}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='perAmount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Per Rp berapa</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Kosongkan jika flat'
                  disabled={disabled}
                  {...field}
                  value={(field.value ?? '') as string | number}
                />
              </FormControl>
              <FormDescription>Kosong = poin flat per aktivitas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' size='sm' disabled={disabled || mutation.isPending}>
          Simpan
        </Button>
      </form>
    </Form>
  )
}

export function RatesForm({ disabled }: { disabled: boolean }) {
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['admin-poin-rules'],
    queryFn: listPointRules,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Konversi Poin</CardTitle>
        <CardDescription>
          Tentukan berapa KopPoin yang didapat anggota dari tiap aktivitas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            Memuat data...
          </p>
        ) : (
          rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} disabled={disabled} />
          ))
        )}
      </CardContent>
    </Card>
  )
}
