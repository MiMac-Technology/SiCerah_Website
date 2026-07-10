import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type TransactionItem = {
  name: string
  qty: number
  unitPriceMember: number
  unitPriceNonMember: number
}

export type BuyerType = 'anggota' | 'non-anggota' | 'tanpa-ponsel'
export type WaVerificationStatus =
  | 'Menunggu Verifikasi'
  | 'Terverifikasi'
  | 'Dikonfirmasi Langsung'

export type VoidStatus = 'Diminta' | 'Disetujui' | 'Ditolak'

export type Transaction = {
  id: string
  trxNo: string
  timestamp: string
  buyerType: BuyerType
  buyerName?: string
  memberId?: string
  buyerPhone?: string
  items: TransactionItem[]
  totalMember: number
  totalNonMember: number
  totalCharged: number
  kontribusiU?: number
  kopPoinEarned?: number
  waVerificationStatus?: WaVerificationStatus
  /** Alur void: kasir mengajukan, bendahara menyetujui/menolak. */
  voidStatus?: VoidStatus
  voidReason?: string
}

export type AddTransactionInput = {
  buyerType: BuyerType
  buyerName?: string
  memberId?: string
  buyerPhone?: string
  items: TransactionItem[]
}

/** Persentase kontribusi anggota (U_i) yang dicatat dari total belanja. */
const KONTRIBUSI_PCT = 0.02
const KOPPOIN_PER_RUPIAH = 1 / 1000

type TransactionsState = {
  transactions: Transaction[]
  addTransaction: (input: AddTransactionInput, actorRole: Role) => Transaction
  simulateWaVerification: (id: string, actorRole: Role) => void
  requestVoid: (id: string, reason: string, actorRole: Role) => void
  resolveVoid: (id: string, approved: boolean, actorRole: Role) => void
}

function computeTotals(items: TransactionItem[]) {
  return items.reduce(
    (acc, item) => ({
      totalMember: acc.totalMember + item.qty * item.unitPriceMember,
      totalNonMember: acc.totalNonMember + item.qty * item.unitPriceNonMember,
    }),
    { totalMember: 0, totalNonMember: 0 }
  )
}

function seedTransactions(): Transaction[] {
  faker.seed(4004)
  return Array.from({ length: 50 }, (_, i) => {
    const items: TransactionItem[] = Array.from(
      { length: faker.number.int({ min: 1, max: 4 }) },
      () => {
        const unitPriceMember = faker.number.int({ min: 5000, max: 50000 })
        return {
          name: faker.commerce.productName(),
          qty: faker.number.int({ min: 1, max: 5 }),
          unitPriceMember,
          unitPriceNonMember: Math.round(unitPriceMember * 1.08),
        }
      }
    )
    const { totalMember, totalNonMember } = computeTotals(items)
    const buyerType = faker.helpers.weightedArrayElement<BuyerType>([
      { value: 'anggota', weight: 6 },
      { value: 'non-anggota', weight: 3 },
      { value: 'tanpa-ponsel', weight: 1 },
    ])
    const isMember = buyerType === 'anggota'
    const totalCharged = isMember ? totalMember : totalNonMember
    return {
      id: genId('trx'),
      trxNo: `TRX-${String(i + 1).padStart(5, '0')}`,
      timestamp: faker.date.recent({ days: 45 }).toISOString(),
      buyerType,
      buyerName: isMember ? undefined : faker.person.fullName(),
      buyerPhone: isMember ? undefined : `08${faker.string.numeric(10)}`,
      items,
      totalMember,
      totalNonMember,
      totalCharged,
      kontribusiU: isMember ? Math.round(totalCharged * KONTRIBUSI_PCT) : undefined,
      kopPoinEarned: isMember
        ? Math.floor(totalCharged * KOPPOIN_PER_RUPIAH)
        : undefined,
      waVerificationStatus: isMember
        ? undefined
        : buyerType === 'tanpa-ponsel'
          ? 'Dikonfirmasi Langsung'
          : faker.helpers.arrayElement<WaVerificationStatus>([
              'Menunggu Verifikasi',
              'Terverifikasi',
            ]),
    }
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: seedTransactions(),
      addTransaction: (input, actorRole) => {
        const { totalMember, totalNonMember } = computeTotals(input.items)
        const isMember = input.buyerType === 'anggota'
        const totalCharged = isMember ? totalMember : totalNonMember
        const transaction: Transaction = {
          ...input,
          id: genId('trx'),
          trxNo: `TRX-${String(get().transactions.length + 1).padStart(5, '0')}`,
          timestamp: new Date().toISOString(),
          totalMember,
          totalNonMember,
          totalCharged,
          kontribusiU: isMember
            ? Math.round(totalCharged * KONTRIBUSI_PCT)
            : undefined,
          kopPoinEarned: isMember
            ? Math.floor(totalCharged * KOPPOIN_PER_RUPIAH)
            : undefined,
          waVerificationStatus: isMember
            ? undefined
            : input.buyerType === 'tanpa-ponsel'
              ? 'Dikonfirmasi Langsung'
              : 'Menunggu Verifikasi',
        }
        set((state) => ({ transactions: [transaction, ...state.transactions] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Kasir',
          action: 'Mencatat transaksi penjualan',
          module: 'pos',
          targetId: transaction.id,
          detail: `${transaction.trxNo} — Rp${transaction.totalCharged.toLocaleString('id-ID')}`,
        })
        return transaction
      },
      requestVoid: (id, reason, actorRole) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, voidStatus: 'Diminta', voidReason: reason } : t
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Kasir',
          action: 'Mengajukan void transaksi (menunggu approval Bendahara)',
          module: 'pos',
          targetId: id,
          detail: reason,
        })
      },
      resolveVoid: (id, approved, actorRole) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, voidStatus: approved ? 'Disetujui' : 'Ditolak' }
              : t
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: approved
            ? 'Menyetujui void transaksi'
            : 'Menolak void transaksi',
          module: 'pos',
          targetId: id,
        })
      },
      simulateWaVerification: (id, actorRole) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, waVerificationStatus: 'Terverifikasi' } : t
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Kasir',
          action: 'Simulasi konfirmasi WA diterima',
          module: 'pos',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-transactions-store' }
  )
)
