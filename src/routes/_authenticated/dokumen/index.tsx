import { createFileRoute } from '@tanstack/react-router'
import { Dokumen } from '@/features/dokumen'

export const Route = createFileRoute('/_authenticated/dokumen/')({
  component: Dokumen,
})
