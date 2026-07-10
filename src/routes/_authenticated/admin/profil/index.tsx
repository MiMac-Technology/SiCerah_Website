import { createFileRoute } from '@tanstack/react-router'
import { AdminProfil } from '@/features/admin-profil'

export const Route = createFileRoute('/_authenticated/admin/profil/')({
  component: AdminProfil,
})
