import { z } from 'zod'

export const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive('Pilih produk terlebih dahulu'),
  name: z.string().min(1, 'Nama item wajib diisi'),
  qty: z.coerce.number().int().positive('Qty minimal 1'),
  unitPriceMember: z.coerce.number().nonnegative(),
  unitPriceNonMember: z.coerce.number().nonnegative(),
})

export const posFormSchema = z
  .object({
    buyerType: z.enum(['anggota', 'non-anggota', 'tanpa-ponsel']),
    memberId: z.coerce.number().optional(),
    buyerName: z.string().optional(),
    buyerPhone: z.string().optional(),
    items: z.array(cartItemSchema).min(1, 'Tambahkan minimal 1 item'),
  })
  .superRefine((data, ctx) => {
    if (data.buyerType === 'anggota' && !data.memberId) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberId'],
        message: 'Pilih anggota terlebih dahulu',
      })
    }
    if (data.buyerType === 'non-anggota') {
      if (!data.buyerName) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyerName'],
          message: 'Nama pembeli wajib diisi',
        })
      }
      if (!data.buyerPhone) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyerPhone'],
          message: 'Nomor WhatsApp wajib diisi untuk verifikasi',
        })
      }
    }
    if (data.buyerType === 'tanpa-ponsel' && !data.buyerName) {
      ctx.addIssue({
        code: 'custom',
        path: ['buyerName'],
        message: 'Nama pembeli wajib diisi',
      })
    }
  })

export type PosFormValues = z.infer<typeof posFormSchema>
