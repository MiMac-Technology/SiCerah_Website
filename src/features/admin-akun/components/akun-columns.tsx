import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Power } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { STAFF_ROLE_LABELS, type StaffRole } from '@/config/roles'
import { type StaffAccount } from '@/stores/accounts-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { useAkun } from './akun-provider'

function AkunRowActions({ row }: { row: StaffAccount }) {
  const { setCurrentRow, setOpen } = useAkun()
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>Menu aksi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row)
            setOpen('update')
          }}
        >
          <Pencil className='size-4' /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row)
            setOpen('status')
          }}
        >
          <Power className='size-4' />
          {row.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const akunColumns: ColumnDef<StaffAccount>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'No. WhatsApp',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant='outline'>
        {STAFF_ROLE_LABELS[row.getValue('role') as StaffRole]}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={row.getValue('status') === 'aktif' ? 'default' : 'secondary'}
      >
        {row.getValue('status') === 'aktif' ? 'Aktif' : 'Nonaktif'}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: 'createdAt',
    header: 'Dibuat',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => <AkunRowActions row={row.original} />,
  },
]
