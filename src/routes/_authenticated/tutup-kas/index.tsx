import { createFileRoute } from '@tanstack/react-router'
import { TutupKas } from '@/features/tutup-kas'

export const Route = createFileRoute('/_authenticated/tutup-kas/')({
  component: TutupKas,
})
