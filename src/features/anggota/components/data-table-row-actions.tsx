import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { type Member } from '@/stores/members-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAnggota } from './anggota-provider'

type DataTableRowActionsProps = {
  row: Row<Member>
  disabled: boolean
}

export function DataTableRowActions({ row, disabled }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAnggota()
  const isActive = row.original.status === 'aktif'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex size-8 p-0 data-[state=open]:bg-muted'
          disabled={disabled}
        >
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>Buka menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          disabled={disabled}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('update')
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={disabled}
          variant={isActive ? 'destructive' : 'default'}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('deactivate')
          }}
        >
          {isActive ? 'Nonaktifkan' : 'Aktifkan kembali'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
