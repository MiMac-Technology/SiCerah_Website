import { createFileRoute } from '@tanstack/react-router'
import { AdminKeuangan } from '@/features/admin-keuangan'

export const Route = createFileRoute('/_authenticated/admin/keuangan/')({
  component: AdminKeuangan,
})
