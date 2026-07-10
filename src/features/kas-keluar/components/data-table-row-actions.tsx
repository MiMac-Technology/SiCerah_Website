import { type Row } from '@tanstack/react-table'
import { FilePenLine, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { type Expense } from '@/stores/expenses-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useKasKeluar } from './kas-keluar-provider'

type DataTableRowActionsProps = {
  row: Row<Expense>
  disabled?: boolean
}

export function DataTableRowActions({
  row,
  disabled = false,
}: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useKasKeluar()
  const canVerify =
    row.original.status === 'Menunggu Verifikasi' &&
    !row.original.requiresApproval
  // Entri koreksi tidak bisa dikoreksi lagi — koreksi selalu merujuk entri asli.
  const canCorrect = !row.original.correctionOfId

  if (!canVerify && !canCorrect) {
    return (
      <Button variant='ghost' className='flex size-8 p-0' disabled>
        <MoreHorizontal className='size-4' />
        <span className='sr-only'>Tidak ada aksi</span>
      </Button>
    )
  }

  return (
    <DropdownMenu modal={false}>
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
      <DropdownMenuContent align='end' className='w-44'>
        {canVerify && (
          <DropdownMenuItem
            disabled={disabled}
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('verify')
            }}
          >
            <ShieldCheck className='size-4' /> Verifikasi
          </DropdownMenuItem>
        )}
        {canCorrect && (
          <DropdownMenuItem
            disabled={disabled}
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('correct')
            }}
          >
            <FilePenLine className='size-4' /> Koreksi (Append-Only)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
