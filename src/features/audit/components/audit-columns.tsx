import { type ColumnDef } from '@tanstack/react-table'
import { formatDateTime } from '@/lib/format'
import { ROLE_LABELS } from '@/config/roles'
import { type AuditEntry, type AuditModule } from '@/stores/audit-store'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'

export const MODULE_LABELS: Record<AuditModule, string> = {
  pos: 'POS',
  pengumuman: 'Pengumuman',
  anggota: 'Anggota',
  'kas-keluar': 'Kas Keluar',
  approval: 'Approval',
  'shu-config': 'Konfigurasi SHU',
  admin: 'Administrator',
  logistik: 'Logistik',
}

export const auditColumns: ColumnDef<AuditEntry>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Waktu' />
    ),
    cell: ({ row }) => formatDateTime(row.getValue('timestamp')),
  },
  {
    accessorKey: 'actorLabel',
    header: 'Pelaku',
  },
  {
    accessorKey: 'activeRole',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant='outline'>
        {ROLE_LABELS[row.getValue('activeRole') as keyof typeof ROLE_LABELS]}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: 'module',
    header: 'Modul',
    cell: ({ row }) => (
      <Badge variant='secondary'>
        {MODULE_LABELS[row.getValue('module') as AuditModule]}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: 'action',
    header: 'Aksi',
  },
  {
    accessorKey: 'detail',
    header: 'Detail',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {(row.getValue('detail') as string | undefined) ?? '-'}
      </span>
    ),
  },
]
