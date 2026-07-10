import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Member } from '@/stores/members-store'
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
        return status === 'aktif' ? (
          <Badge variant='default'>Aktif</Badge>
        ) : (
          <Badge variant='secondary'>Nonaktif</Badge>
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
