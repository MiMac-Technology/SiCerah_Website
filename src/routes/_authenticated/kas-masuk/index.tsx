import { createFileRoute } from '@tanstack/react-router'
import { KasMasuk } from '@/features/kas-masuk'

export const Route = createFileRoute('/_authenticated/kas-masuk/')({
  component: KasMasuk,
})
