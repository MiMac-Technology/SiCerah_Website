import { createFileRoute } from '@tanstack/react-router'
import { Pengumuman } from '@/features/pengumuman'

export const Route = createFileRoute('/_authenticated/pengumuman/')({
  component: Pengumuman,
})
