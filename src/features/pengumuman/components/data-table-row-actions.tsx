import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useRole } from '@/context/role-provider'
import { useAnnouncementsStore, type Announcement } from '@/stores/announcements-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePengumuman } from './pengumuman-provider'

type DataTableRowActionsProps = {
  row: Row<Announcement>
  disabled?: boolean
}

export function DataTableRowActions({
  row,
  disabled = false,
}: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePengumuman()
  const { activeRole } = useRole()
  const togglePublish = useAnnouncementsStore((s) => s.togglePublish)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex size-8 p-0 data-[state=open]:bg-muted'
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
          onClick={() => togglePublish(row.original.id, activeRole)}
        >
          {row.original.published ? 'Jadikan draft' : 'Publikasikan'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={disabled}
          variant='destructive'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
