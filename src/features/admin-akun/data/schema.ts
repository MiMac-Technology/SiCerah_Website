import { z } from 'zod'

const baseFields = {
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.email('Email tidak valid'),
  phone: z.string().min(9, 'Nomor WhatsApp wajib diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit angka').regex(/^\d+$/, 'NIK harus 16 digit angka'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  role: z.enum(['kasir', 'bendahara', 'logistik', 'sekretaris', 'pengawas']),
}

export const createStaffAccountFormSchema = z.object({
  ...baseFields,
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const updateStaffAccountFormSchema = z.object(baseFields)

export type CreateStaffAccountFormValues = z.infer<
  typeof createStaffAccountFormSchema
>
export type UpdateStaffAccountFormValues = z.infer<
  typeof updateStaffAccountFormSchema
>
