import { createFileRoute } from '@tanstack/react-router'
import { SupplierPage } from '@/features/supplier'

export const Route = createFileRoute('/_authenticated/supplier/')({
  component: SupplierPage,
})
