import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

/** Pinjaman di atas nominal ini harus dieskalasi ke Ketua. */
export const LOAN_ESCALATION_THRESHOLD = 5_000_000
/** Jasa pinjaman flat per bulan (untuk hitung cicilan). */
export const LOAN_MONTHLY_RATE = 0.01

export type LoanStatus =
  | 'Menunggu Bendahara'
  | 'Menunggu Ketua'
  | 'Disetujui'
  | 'Ditolak'

export type Loan = {
  id: string
  loanNo: string
  memberName: string
  memberNo: string
  phone: string
  amount: number
  tenorMonths: number
  purpose: string
  monthlyInstallment: number
  status: LoanStatus
  requestedAt: string
  decidedAt?: string
  decidedBy?: string
  firstDueDate?: string
}

type LoansState = {
  loans: Loan[]
  approveLoan: (id: string, firstDueDate: string, actorRole: Role) => void
  rejectLoan: (id: string, actorRole: Role) => void
  escalateLoan: (id: string, actorRole: Role) => void
  logReminderSent: (id: string, actorRole: Role) => void
}

export function computeInstallment(amount: number, tenorMonths: number) {
  return Math.ceil((amount / tenorMonths) * (1 + LOAN_MONTHLY_RATE))
}

function seedLoans(): Loan[] {
  faker.seed(1212)
  const configs: { amount: number; status: LoanStatus }[] = [
    { amount: 1_500_000, status: 'Menunggu Bendahara' },
    { amount: 3_000_000, status: 'Menunggu Bendahara' },
    { amount: 8_000_000, status: 'Menunggu Bendahara' },
    { amount: 12_000_000, status: 'Menunggu Ketua' },
    { amount: 2_500_000, status: 'Disetujui' },
    { amount: 4_000_000, status: 'Ditolak' },
    { amount: 900_000, status: 'Disetujui' },
  ]
  return configs.map((cfg, i) => {
    const tenorMonths = faker.helpers.arrayElement([6, 10, 12, 18])
    return {
      id: genId('loan'),
      loanNo: `PJM-${String(i + 1).padStart(4, '0')}`,
      memberName: faker.person.fullName(),
      memberNo: `A-${String(faker.number.int({ min: 1, max: 30 })).padStart(4, '0')}`,
      phone: `08${faker.string.numeric(10)}`,
      amount: cfg.amount,
      tenorMonths,
      purpose: faker.helpers.arrayElement([
        'Modal usaha warung',
        'Pupuk dan bibit musim tanam',
        'Biaya sekolah anak',
        'Renovasi kandang ternak',
        'Modal dagang hasil panen',
      ]),
      monthlyInstallment: computeInstallment(cfg.amount, tenorMonths),
      status: cfg.status,
      requestedAt: faker.date.recent({ days: 14 }).toISOString(),
      decidedAt:
        cfg.status === 'Disetujui' || cfg.status === 'Ditolak'
          ? faker.date.recent({ days: 7 }).toISOString()
          : undefined,
      firstDueDate:
        cfg.status === 'Disetujui'
          ? faker.date.soon({ days: 30 }).toISOString()
          : undefined,
    }
  })
}

function patchLoan(
  set: (fn: (state: LoansState) => Partial<LoansState>) => void,
  id: string,
  patch: Partial<Loan>
) {
  set((state) => ({
    loans: state.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  }))
}

export const useLoansStore = create<LoansState>()(
  persist(
    (set) => ({
      loans: seedLoans(),
      approveLoan: (id, firstDueDate, actorRole) => {
        patchLoan(set, id, {
          status: 'Disetujui',
          decidedAt: new Date().toISOString(),
          decidedBy: actorRole === 'ketua' ? 'Ketua' : 'Bendahara',
          firstDueDate,
        })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: actorRole === 'ketua' ? 'Ketua' : 'Bendahara',
          action: 'Menyetujui pengajuan pinjaman',
          module: 'kas-keluar',
          targetId: id,
        })
      },
      rejectLoan: (id, actorRole) => {
        patchLoan(set, id, {
          status: 'Ditolak',
          decidedAt: new Date().toISOString(),
          decidedBy: actorRole === 'ketua' ? 'Ketua' : 'Bendahara',
        })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: actorRole === 'ketua' ? 'Ketua' : 'Bendahara',
          action: 'Menolak pengajuan pinjaman',
          module: 'kas-keluar',
          targetId: id,
        })
      },
      escalateLoan: (id, actorRole) => {
        patchLoan(set, id, { status: 'Menunggu Ketua' })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Mengeskalasi pengajuan pinjaman nilai besar ke Ketua',
          module: 'kas-keluar',
          targetId: id,
        })
      },
      logReminderSent: (id, actorRole) => {
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Mengirim reminder cicilan via WhatsApp',
          module: 'kas-keluar',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-loans-store' }
  )
)
