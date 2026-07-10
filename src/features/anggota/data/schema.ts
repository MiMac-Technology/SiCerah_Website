import { z } from 'zod'

export const registerMemberFormSchema = z.object({
  fullName: z.string().min(1, 'Nama wajib diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  address: z.string().min(1, 'Alamat KTP wajib diisi'),
  domicileAddress: z.string().optional(),
  phone: z.string().min(9, 'Nomor WhatsApp wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  ktpPhotoDataUrl: z.string().min(1, 'Foto KTP wajib diunggah'),
})
export type RegisterMemberFormValues = z.infer<typeof registerMemberFormSchema>

export const editMemberFormSchema = registerMemberFormSchema.omit({
  phone: true,
  ktpPhotoDataUrl: true,
})
export type EditMemberFormValues = z.infer<typeof editMemberFormSchema>
