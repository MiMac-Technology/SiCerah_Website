import { z } from 'zod'

export const shuConfigFormSchema = z
  .object({
    koperasiName: z.string().min(1, 'Nama koperasi wajib diisi'),
    fiscalYear: z.coerce.number().int().min(2000).max(2100),
    jasaModalPct: z.coerce.number().min(0).max(100),
    jasaUsahaPct: z.coerce.number().min(0).max(100),
    cadanganPct: z.coerce.number().min(0).max(100),
    danaSosialPct: z.coerce.number().min(0).max(100),
    danaPengurusPct: z.coerce.number().min(0).max(100),
    approvalThreshold: z.coerce.number().positive('Ambang batas harus lebih dari 0'),
  })
  .refine(
    (data) =>
      data.jasaModalPct +
        data.jasaUsahaPct +
        data.cadanganPct +
        data.danaSosialPct +
        data.danaPengurusPct <=
      100,
    {
      message: 'Total persentase alokasi SHU tidak boleh lebih dari 100%',
      path: ['jasaModalPct'],
    }
  )

export type ShuConfigFormValues = z.infer<typeof shuConfigFormSchema>
