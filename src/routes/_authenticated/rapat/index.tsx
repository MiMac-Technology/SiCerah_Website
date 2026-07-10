import { createFileRoute } from '@tanstack/react-router'
import { Rapat } from '@/features/rapat'

export const Route = createFileRoute('/_authenticated/rapat/')({
  component: Rapat,
})
