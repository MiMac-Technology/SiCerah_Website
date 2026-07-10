import { createFileRoute } from '@tanstack/react-router'
import { PenukaranPoin } from '@/features/penukaran-poin'

export const Route = createFileRoute('/_authenticated/penukaran-poin/')({
  component: PenukaranPoin,
})
