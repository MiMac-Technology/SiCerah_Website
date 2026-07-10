import { z } from 'zod'

export const staffAccountFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Email tidak valid'),
  phone: z.string().min(9, 'Nomor WhatsApp wajib diisi'),
  role: z.enum(['kasir', 'bendahara', 'logistik', 'sekretaris', 'pengawas']),
})

export type StaffAccountFormValues = z.infer<typeof staffAccountFormSchema>
