import { createFileRoute } from '@tanstack/react-router'
import { Kontrak } from '@/features/kontrak'

export const Route = createFileRoute('/_authenticated/kontrak/')({
  component: Kontrak,
})
