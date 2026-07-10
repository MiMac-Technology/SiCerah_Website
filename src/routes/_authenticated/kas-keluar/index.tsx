import { createFileRoute } from '@tanstack/react-router'
import { KasKeluar } from '@/features/kas-keluar'

export const Route = createFileRoute('/_authenticated/kas-keluar/')({
  component: KasKeluar,
})
