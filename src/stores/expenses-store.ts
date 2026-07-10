import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useApprovalsStore } from '@/stores/approvals-store'
import { useAuditStore } from '@/stores/audit-store'
import { useShuConfigStore } from '@/stores/shu-config-store'
import { type Role } from '@/config/roles'

export type ExpenseStatus =
  | 'Menunggu Verifikasi'
  | 'Terverifikasi'
  | 'Menunggu Approval'
  | 'Disetujui'
  | 'Ditolak'

export const EXPENSE_CATEGORIES = [
  'Operasional',
  'Gaji & Honor',
  'Pengadaan Barang',
  'Pemeliharaan',
  'Sosial & Bantuan',
  'Lainnya',
] as const

export type Expense = {
  id: string
  expenseNo: string
  date: string
  category: (typeof EXPENSE_CATEGORIES)[number]
  description: string
  amount: number
  proofPhotoDataUrl: string
  status: ExpenseStatus
  requiresApproval: boolean
  approvalId?: string
  /** Terisi jika entri ini adalah koreksi atas entri lain (append-only ledger). */
  correctionOfId?: string
  correctionOfNo?: string
  correctionReason?: string
  createdAt: string
}

export type AddExpenseInput = {
  date: string
  category: (typeof EXPENSE_CATEGORIES)[number]
  description: string
  amount: number
  proofPhotoDataUrl: string
}

type ExpensesState = {
  expenses: Expense[]
  addExpense: (data: AddExpenseInput, actorRole: Role) => Expense
  verifyExpense: (id: string, actorRole: Role) => void
  setExpenseStatus: (id: string, status: 'Disetujui' | 'Ditolak') => void
  /**
   * Koreksi append-only: entri lama tidak diubah; entri baru berisi selisih
   * (newAmount - oldAmount) dan mereferensi entri lama.
   */
  addCorrection: (
    originalId: string,
    newAmount: number,
    reason: string,
    actorRole: Role
  ) => void
}

function seedExpenses(): Expense[] {
  faker.seed(6006)
  return Array.from({ length: 15 }, (_, i) => {
    const amount = faker.number.int({ min: 200_000, max: 8_000_000 })
    const requiresApproval = amount > 2_000_000
    const status = faker.helpers.arrayElement<ExpenseStatus>(
      requiresApproval
        ? ['Menunggu Approval', 'Disetujui', 'Ditolak']
        : ['Menunggu Verifikasi', 'Terverifikasi']
    )
    return {
      id: genId('exp'),
      expenseNo: `KK-${String(i + 1).padStart(4, '0')}`,
      date: faker.date.recent({ days: 60 }).toISOString(),
      category: faker.helpers.arrayElement(EXPENSE_CATEGORIES),
      description: faker.lorem.sentence({ min: 5, max: 10 }),
      amount,
      proofPhotoDataUrl: '',
      status,
      requiresApproval,
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
    }
  })
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set, get) => {
      return {
        expenses: seedExpenses(),
        addExpense: (data, actorRole) => {
          const threshold = useShuConfigStore.getState().config.approvalThreshold
          const requiresApproval = data.amount > threshold
          const expense: Expense = {
            ...data,
            id: genId('exp'),
            expenseNo: `KK-${String(get().expenses.length + 1).padStart(4, '0')}`,
            status: requiresApproval ? 'Menunggu Approval' : 'Menunggu Verifikasi',
            requiresApproval,
            createdAt: new Date().toISOString(),
          }
          if (requiresApproval) {
            const approval = useApprovalsStore.getState().createApprovalRequest({
              title: `Pengeluaran: ${expense.category}`,
              sourceId: expense.id,
              amount: expense.amount,
              description: expense.description,
              proofPhotoDataUrl: expense.proofPhotoDataUrl,
            })
            expense.approvalId = approval.id
          }
          set((state) => ({ expenses: [expense, ...state.expenses] }))
          useAuditStore.getState().logAction({
            activeRole: actorRole,
            actorLabel: 'Bendahara',
            action: 'Mencatat pengeluaran kas',
            module: 'kas-keluar',
            targetId: expense.id,
            detail: `${expense.expenseNo} — Rp${expense.amount.toLocaleString('id-ID')}`,
          })
          return expense
        },
        verifyExpense: (id, actorRole) => {
          set((state) => ({
            expenses: state.expenses.map((e) =>
              e.id === id ? { ...e, status: 'Terverifikasi' } : e
            ),
          }))
          useAuditStore.getState().logAction({
            activeRole: actorRole,
            actorLabel: 'Bendahara',
            action: 'Memverifikasi pengeluaran kas',
            module: 'kas-keluar',
            targetId: id,
          })
        },
        addCorrection: (originalId, newAmount, reason, actorRole) => {
          const original = get().expenses.find((e) => e.id === originalId)
          if (!original) return
          const delta = newAmount - original.amount
          const entry: Expense = {
            id: genId('exp'),
            expenseNo: `KK-${String(get().expenses.length + 1).padStart(4, '0')}`,
            date: new Date().toISOString(),
            category: original.category,
            description: `Koreksi ${original.expenseNo}: ${reason}`,
            amount: delta,
            proofPhotoDataUrl: original.proofPhotoDataUrl,
            status: 'Terverifikasi',
            requiresApproval: false,
            correctionOfId: original.id,
            correctionOfNo: original.expenseNo,
            correctionReason: reason,
            createdAt: new Date().toISOString(),
          }
          set((state) => ({ expenses: [entry, ...state.expenses] }))
          useAuditStore.getState().logAction({
            activeRole: actorRole,
            actorLabel: 'Bendahara',
            action: 'Membuat entri koreksi kas keluar (append-only)',
            module: 'kas-keluar',
            targetId: entry.id,
            detail: `Koreksi ${original.expenseNo}: ${reason}`,
          })
        },
        setExpenseStatus: (id, status) => {
          set((state) => ({
            expenses: state.expenses.map((e) =>
              e.id === id ? { ...e, status } : e
            ),
          }))
        },
      }
    },
    { name: 'sicerah-expenses-store' }
  )
)
