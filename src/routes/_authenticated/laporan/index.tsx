import { createFileRoute } from '@tanstack/react-router'
import { Laporan } from '@/features/laporan'

export const Route = createFileRoute('/_authenticated/laporan/')({
  component: Laporan,
})
