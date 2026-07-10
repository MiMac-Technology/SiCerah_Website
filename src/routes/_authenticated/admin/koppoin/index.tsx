import { createFileRoute } from '@tanstack/react-router'
import { AdminKopPoin } from '@/features/admin-koppoin'

export const Route = createFileRoute('/_authenticated/admin/koppoin/')({
  component: AdminKopPoin,
})
