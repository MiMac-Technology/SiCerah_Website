import { createFileRoute } from '@tanstack/react-router'
import { KonfigurasiShu } from '@/features/konfigurasi-shu'

export const Route = createFileRoute('/_authenticated/konfigurasi-shu/')({
  component: KonfigurasiShu,
})
