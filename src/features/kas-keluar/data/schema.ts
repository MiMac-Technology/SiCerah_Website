import { z } from 'zod'

export const expenseFormSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.enum([
    'Operasional',
    'Gaji & Honor',
    'Pengadaan Barang',
    'Pemeliharaan',
    'Sosial & Bantuan',
    'Lainnya',
  ]),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  proofPhotoDataUrl: z.string().min(1, 'Bukti foto kwitansi wajib diunggah'),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
