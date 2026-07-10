import { createFileRoute } from '@tanstack/react-router'
import { SimpanPinjam } from '@/features/simpan-pinjam'

export const Route = createFileRoute('/_authenticated/simpan-pinjam/')({
  component: SimpanPinjam,
})
