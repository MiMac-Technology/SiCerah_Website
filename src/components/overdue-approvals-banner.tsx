import { Link } from '@tanstack/react-router'
import { AlarmClock } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useApprovalsStore } from '@/stores/approvals-store'
import { useLoansStore } from '@/stores/loans-store'

/** Batas waktu approval dianggap terlambat (jam). */
export const ESCALATION_HOURS = 48

function hoursAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (60 * 60 * 1000))
}

/**
 * Eskalasi otomatis: sistem menandai approval yang pending melewati batas
 * waktu dan menampilkannya sebagai notifikasi ke Ketua. Render hanya untuk
 * role ketua (atau pemegang delegasi).
 */
export function OverdueApprovalsBanner() {
  const approvals = useApprovalsStore((s) => s.approvals)
  const loans = useLoansStore((s) => s.loans)

  const overdueApprovals = approvals.filter(
    (a) => a.status === 'Berjalan' && hoursAgo(a.createdAt) >= ESCALATION_HOURS
  )
  const overdueLoans = loans.filter(
    (l) =>
      l.status === 'Menunggu Ketua' &&
      hoursAgo(l.requestedAt) >= ESCALATION_HOURS
  )

  if (overdueApprovals.length === 0 && overdueLoans.length === 0) return null

  return (
    <div className='mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4'>
      <p className='mb-2 flex items-center gap-2 text-sm font-semibold'>
        <AlarmClock className='size-4 text-destructive' />
        Eskalasi Otomatis — {overdueApprovals.length + overdueLoans.length}{' '}
        approval pending lebih dari {ESCALATION_HOURS} jam tanpa respons
      </p>
      <ul className='space-y-1 text-sm'>
        {overdueApprovals.map((a) => (
          <li key={a.id}>
            <Link to='/approval' className='underline underline-offset-2'>
              {a.title} — {formatCurrency(a.amount)}
            </Link>{' '}
            <span className='text-muted-foreground'>
              (pending {hoursAgo(a.createdAt)} jam)
            </span>
          </li>
        ))}
        {overdueLoans.map((l) => (
          <li key={l.id}>
            <Link to='/simpan-pinjam' className='underline underline-offset-2'>
              Pinjaman {l.loanNo} — {formatCurrency(l.amount)} (
              {l.memberName})
            </Link>{' '}
            <span className='text-muted-foreground'>
              (pending {hoursAgo(l.requestedAt)} jam)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
