import { createFileRoute } from '@tanstack/react-router'
import { Ledger } from '@/features/ledger'

export const Route = createFileRoute('/_authenticated/ledger/')({
  component: Ledger,
})
