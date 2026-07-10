import { createFileRoute } from '@tanstack/react-router'
import { AdminAkun } from '@/features/admin-akun'

export const Route = createFileRoute('/_authenticated/admin/akun/')({
  component: AdminAkun,
})
