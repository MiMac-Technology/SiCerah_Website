import { formatCurrency, formatDate } from '@/lib/format'
import {
  getQuorumMet,
  VOTER_ROLES,
  type ApprovalRequest,
} from '@/stores/approvals-store'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useApprovalUi } from './approval-provider'

function statusVariant(status: ApprovalRequest['status']) {
  if (status === 'Disetujui') return 'default' as const
  if (status === 'Ditolak') return 'destructive' as const
  return 'secondary' as const
}

export function ApprovalList({ data }: { data: ApprovalRequest[] }) {
  const { setSelectedId } = useApprovalUi()

  if (data.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        Belum ada pengajuan approval.
      </p>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {data.map((approval) => (
        <Card
          key={approval.id}
          className='cursor-pointer transition-colors hover:border-primary'
          onClick={() => setSelectedId(approval.id)}
        >
          <CardHeader>
            <div className='flex items-start justify-between gap-2'>
              <CardTitle className='text-base'>{approval.title}</CardTitle>
              <Badge variant={statusVariant(approval.status)}>
                {approval.status}
              </Badge>
            </div>
            <CardDescription>{formatDate(approval.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='text-lg font-semibold'>
              {formatCurrency(approval.amount)}
            </p>
            <p className='line-clamp-2 text-sm text-muted-foreground'>
              {approval.description}
            </p>
            <p className='text-xs text-muted-foreground'>
              {approval.votes.length}/{VOTER_ROLES.length} suara —{' '}
              {getQuorumMet(approval) ? 'Kuorum tercapai' : 'Menunggu kuorum'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
