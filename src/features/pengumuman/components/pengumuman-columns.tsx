import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/format'
import { type Announcement } from '@/stores/announcements-store'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'

export function getPengumumanColumns(
  disabled: boolean
): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Judul' />
      ),
      cell: ({ row }) => (
        <span className='max-w-75 truncate font-medium'>
          {row.getValue('title')}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kategori' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>{row.getValue('category')}</Badge>
      ),
      filterFn: (row, id, value: string[]) =>
        value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'published',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const published = row.getValue('published') as boolean
        return (
          <Badge variant={published ? 'default' : 'secondary'}>
            {published ? 'Terbit' : 'Draft'}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tanggal' />
      ),
      cell: ({ row }) => <span>{formatDate(row.getValue('createdAt'))}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} disabled={disabled} />,
    },
  ]
}
