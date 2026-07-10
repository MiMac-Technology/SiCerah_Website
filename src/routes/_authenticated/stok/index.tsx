import { createFileRoute } from '@tanstack/react-router'
import { Stok } from '@/features/stok'

export const Route = createFileRoute('/_authenticated/stok/')({
  component: Stok,
})
