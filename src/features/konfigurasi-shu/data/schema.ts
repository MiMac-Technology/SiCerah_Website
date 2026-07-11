import { z } from 'zod'

/**
 * Aturan bisnis backend (ShuParameterService::assertPercentagesBalance):
 * DUA grup persentase terpisah, masing-masing HARUS pas 100 — bukan satu
 * grup gabungan <=100 seperti versi mock sebelumnya.
 */
export const shuConfigFormSchema = z
  .object({
    jasaModalPct: z.coerce.number().min(0).max(100),
    jasaUsahaPct: z.coerce.number().min(0).max(100),
    cadanganPct: z.coerce.number().min(0).max(100),
    porsiAnggotaPct: z.coerce.number().min(0).max(100),
    danaPengurusPct: z.coerce.number().min(0).max(100),
    danaLainPct: z.coerce.number().min(0).max(100),
  })
  .refine((data) => Math.abs(data.jasaModalPct + data.jasaUsahaPct - 100) < 0.01, {
    message: 'Jasa Modal + Jasa Usaha harus berjumlah tepat 100%',
    path: ['jasaModalPct'],
  })
  .refine(
    (data) =>
      Math.abs(
        data.cadanganPct + data.porsiAnggotaPct + data.danaPengurusPct + data.danaLainPct - 100
      ) < 0.01,
    {
      message: 'Cadangan + Porsi Anggota + Dana Pengurus + Dana Lain harus berjumlah tepat 100%',
      path: ['cadanganPct'],
    }
  )

export type ShuConfigFormValues = z.infer<typeof shuConfigFormSchema>

export const fiscalYearFormSchema = z
  .object({
    name: z.string().min(1, 'Nama tahun buku wajib diisi'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  })

export type FiscalYearFormValues = z.infer<typeof fiscalYearFormSchema>
