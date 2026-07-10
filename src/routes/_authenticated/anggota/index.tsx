import { createFileRoute } from '@tanstack/react-router'
import { Anggota } from '@/features/anggota'

export const Route = createFileRoute('/_authenticated/anggota/')({
  component: Anggota,
})
