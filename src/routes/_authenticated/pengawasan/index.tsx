import { createFileRoute } from '@tanstack/react-router'
import { Pengawasan } from '@/features/pengawasan'

export const Route = createFileRoute('/_authenticated/pengawasan/')({
  component: Pengawasan,
})
