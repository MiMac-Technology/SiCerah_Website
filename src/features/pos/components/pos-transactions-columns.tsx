import { type ColumnDef } from '@tanstack/react-table'
import { Ban, Check, Eye, MoreHorizontal, X } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { type BuyerType, type Sale } from '../api'
import { usePos } from './pos-provider'

const BUYER_TYPE_LABEL: Record<BuyerType, string> = {
  anggota: 'Anggota',
  'non-anggota': 'Non-Anggota',
  'tanpa-ponsel': 'Tanpa Ponsel',
}

type VoidActions = {
  onApproveVoid: (sale: Sale) => void
  onRejectVoid: (sale: Sale) => void
}

function TrxRowActions({
  row,
  onApproveVoid,
  onRejectVoid,
}: { row: Sale } & VoidActions) {
  const { setCurrentTransaction, setOpen } = usePos()
  const { activeRole } = useRole()

  const canRequestVoid = activeRole === 'kasir' && !row.voidStatus
  const canResolveVoid = activeRole === 'bendahara' && row.voidStatus === 'Diminta'

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
            setCurrentTransaction(row)
            setOpen('struk')
          }}
        >
          <Eye className='size-4' /> Lihat Struk
        </DropdownMenuItem>
        {canRequestVoid && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              onClick={() => {
                setCurrentTransaction(row)
                setOpen('void')
              }}
            >
              <Ban className='size-4' /> Ajukan Void
            </DropdownMenuItem>
          </>
        )}
        {canResolveVoid && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onApproveVoid(row)}>
              <Check className='size-4' /> Setujui Void
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRejectVoid(row)}>
              <X className='size-4' /> Tolak Void
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StatusCell({ trx }: { trx: Sale }) {
  if (trx.voidStatus === 'Disetujui') {
    return <Badge variant='destructive'>VOID</Badge>
  }
  return (
    <div className='flex flex-wrap gap-1'>
      {trx.buyerType === 'anggota' ? (
        <Badge>Tercatat</Badge>
      ) : (
        <Badge variant={trx.signatureUrl ? 'default' : 'secondary'}>
          {trx.signatureUrl ? 'Sudah Ditandatangani' : 'Menunggu Tanda Tangan'}
        </Badge>
      )}
      {trx.voidStatus === 'Diminta' && (
        <Badge variant='secondary'>Void Diminta</Badge>
      )}
    </div>
  )
}

export function getPosTransactionColumns({
  onApproveVoid,
  onRejectVoid,
}: VoidActions): ColumnDef<Sale>[] {
  return [
    {
      accessorKey: 'trxNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No. Transaksi' />
      ),
      cell: ({ row }) => (
        <span
          className={
            row.original.voidStatus === 'Disetujui'
              ? 'text-muted-foreground line-through'
              : undefined
          }
        >
          {row.getValue('trxNo')}
        </span>
      ),
    },
    {
      id: 'buyer',
      accessorFn: (row) =>
        row.buyerType === 'anggota'
          ? (row.memberName ?? 'Anggota')
          : (row.buyerName ?? '-'),
      header: 'Pembeli',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span>{row.getValue('buyer') as string}</span>
          <span className='text-xs text-muted-foreground'>
            {BUYER_TYPE_LABEL[row.original.buyerType]}
          </span>
        </div>
      ),
      filterFn: (row, _id, value: string[]) =>
        value.includes(row.original.buyerType),
    },
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Waktu' />
      ),
      cell: ({ row }) => formatDateTime(row.getValue('timestamp')),
    },
    {
      accessorKey: 'totalCharged',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Total' />
      ),
      cell: ({ row }) => formatCurrency(row.getValue('totalCharged')),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCell trx={row.original} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <TrxRowActions
          row={row.original}
          onApproveVoid={onApproveVoid}
          onRejectVoid={onRejectVoid}
        />
      ),
    },
  ]
}
