import { type ColumnDef } from '@tanstack/react-table'
import { BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatDateTime } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import {
  CHANNEL_LABELS,
  useAnnouncementsStore,
  type Announcement,
} from '@/stores/announcements-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'

function ReadReceiptCell({
  announcement,
  disabled,
}: {
  announcement: Announcement
  disabled: boolean
}) {
  const { activeRole } = useRole()
  const sendReadReminder = useAnnouncementsStore((s) => s.sendReadReminder)
  const read = announcement.readCount ?? 0
  const total = announcement.totalRecipients ?? 0
  const pct = total > 0 ? Math.round((read / total) * 100) : 0
  const olderThan24h =
    Date.now() - new Date(announcement.createdAt).getTime() >
    24 * 60 * 60 * 1000
  const canRemind =
    !disabled && announcement.published && olderThan24h && read < total

  return (
    <div className='flex items-center gap-2'>
      <div className='min-w-28'>
        <div className='mb-1 flex justify-between text-xs text-muted-foreground'>
          <span>
            {read}/{total} baca
          </span>
          <span>{pct}%</span>
        </div>
        <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full rounded-full bg-primary'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {canRemind && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-7'
              onClick={() => {
                sendReadReminder(announcement.id, activeRole)
                toast.success(
                  `Reminder dikirim ke ${total - read} anggota yang belum membaca`
                )
              }}
            >
              <BellRing className='size-4' />
              <span className='sr-only'>Kirim reminder</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Kirim reminder ke {total - read} anggota yang belum baca (&gt;24
            jam)
          </TooltipContent>
        </Tooltip>
      )}
      {announcement.reminderSentAt && (
        <span className='text-xs text-muted-foreground'>
          Reminder {formatDateTime(announcement.reminderSentAt)}
        </span>
      )}
    </div>
  )
}

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
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      id: 'channel',
      header: 'Channel',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {CHANNEL_LABELS[row.original.channel ?? 'in-app']}
        </span>
      ),
    },
    {
      accessorKey: 'published',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const a = row.original
        const scheduled =
          !!a.scheduledAt && new Date(a.scheduledAt) > new Date()
        if (scheduled) {
          return (
            <Badge variant='outline'>
              Terjadwal {formatDateTime(a.scheduledAt!)}
            </Badge>
          )
        }
        return (
          <Badge variant={a.published ? 'default' : 'secondary'}>
            {a.published ? 'Terbit' : 'Draft'}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
    },
    {
      id: 'readReceipt',
      header: 'Read Receipt',
      cell: ({ row }) => (
        <ReadReceiptCell announcement={row.original} disabled={disabled} />
      ),
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
