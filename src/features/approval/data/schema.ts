import { z } from 'zod'

export const voteFormSchema = z.object({
  decision: z.enum(['setuju', 'tolak']),
  comment: z.string().optional(),
})

export type VoteFormValues = z.infer<typeof voteFormSchema>
