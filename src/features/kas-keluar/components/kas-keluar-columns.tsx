import { type ColumnDef } from '@tanstack/react-table'
import { type Expense, type ExpenseStatus } from '@/stores/expenses-store'
import { formatCurrency, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'

const statusVariantMap: Record<
  ExpenseStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  Terverifikasi: 'default',
  Disetujui: 'default',
  'Menunggu Verifikasi': 'secondary',
  'Menunggu Approval': 'secondary',
  Ditolak: 'destructive',
}

export function getKasKeluarColumns(disabled: boolean): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: 'expenseNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No.' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.getValue('expenseNo')}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tanggal' />
      ),
      cell: ({ row }) => formatDate(row.getValue('date')),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kategori' />
      ),
      cell: ({ row }) => row.getValue('category'),
      filterFn: (row, id, value: string[]) =>
        value.includes(row.getValue(id) as string),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Deskripsi' />
      ),
      cell: ({ row }) => (
        <span className='max-w-75 truncate'>{row.getValue('description')}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nominal' />
      ),
      cell: ({ row }) => formatCurrency(row.getValue('amount')),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as ExpenseStatus
        return (
          <div className='flex items-center gap-2'>
            <Badge variant={statusVariantMap[status]}>{status}</Badge>
            {row.original.requiresApproval && (
              <Badge variant='outline'>Butuh Approval</Badge>
            )}
            {row.original.correctionOfId && (
              <Badge variant='secondary'>
                Koreksi {row.original.correctionOfNo}
              </Badge>
            )}
          </div>
        )
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(row.getValue(id) as string),
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} disabled={disabled} />,
    },
  ]
}
