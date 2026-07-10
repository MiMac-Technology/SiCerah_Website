import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Member } from '@/stores/members-store'
import { STATUS_LABELS, STATUS_VARIANTS } from './anggota-status-dialog'
import { DataTableRowActions } from './data-table-row-actions'

export function getAnggotaColumns(disabled: boolean): ColumnDef<Member>[] {
  return [
    {
      accessorKey: 'memberNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No. Anggota' />
      ),
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nama' />
      ),
    },
    {
      accessorKey: 'phone',
      header: 'No. WhatsApp',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Member['status']
        return (
          <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id) as string)
      },
    },
    {
      accessorKey: 'joinDate',
      header: 'Bergabung',
      cell: ({ row }) => formatDate(row.getValue('joinDate')),
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} disabled={disabled} />,
    },
  ]
}
