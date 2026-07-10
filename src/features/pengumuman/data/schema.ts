import { z } from 'zod'

export const announcementFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(150),
  content: z.string().min(1, 'Isi pengumuman wajib diisi'),
  category: z.enum(['Keuangan', 'RAT', 'Kegiatan', 'Pengeluaran Besar', 'Umum']),
  photoDataUrl: z.string().optional(),
  channel: z.enum(['in-app', 'wa', 'keduanya']),
  scheduledAt: z.string().optional(),
})

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>
