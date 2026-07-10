import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type RedemptionStatus =
  | 'Menunggu Approval'
  | 'Disetujui'
  | 'Dieksekusi'
  | 'Ditolak'

export type RedemptionRequest = {
  id: string
  memberName: string
  memberNo: string
  rewardName: string
  pointCost: number
  requestedAt: string
  status: RedemptionStatus
  approvedAt?: string
  executedAt?: string
}

type RedemptionsState = {
  redemptions: RedemptionRequest[]
  approveRedemption: (id: string, actorRole: Role) => void
  rejectRedemption: (id: string, actorRole: Role) => void
  executeRedemption: (id: string, actorRole: Role) => void
}

const REWARDS = [
  { name: 'Diskon belanja Rp5.000', cost: 500 },
  { name: 'Diskon belanja Rp15.000', cost: 1400 },
  { name: 'Potongan simpanan wajib 1 bulan', cost: 2000 },
  { name: 'Potongan jasa pinjaman 0,5%', cost: 3000 },
]

function seedRedemptions(): RedemptionRequest[] {
  faker.seed(1010)
  const statuses: RedemptionStatus[] = [
    'Menunggu Approval',
    'Menunggu Approval',
    'Disetujui',
    'Disetujui',
    'Dieksekusi',
    'Ditolak',
    'Dieksekusi',
    'Menunggu Approval',
  ]
  return statuses.map((status) => {
    const reward = faker.helpers.arrayElement(REWARDS)
    const requestedAt = faker.date.recent({ days: 7 })
    return {
      id: genId('rdm'),
      memberName: faker.person.fullName(),
      memberNo: `A-${String(faker.number.int({ min: 1, max: 30 })).padStart(4, '0')}`,
      rewardName: reward.name,
      pointCost: reward.cost,
      requestedAt: requestedAt.toISOString(),
      status,
      approvedAt:
        status === 'Disetujui' || status === 'Dieksekusi'
          ? faker.date.recent({ days: 3 }).toISOString()
          : undefined,
      executedAt:
        status === 'Dieksekusi'
          ? faker.date.recent({ days: 1 }).toISOString()
          : undefined,
    }
  })
}

function setStatus(
  set: (fn: (state: RedemptionsState) => Partial<RedemptionsState>) => void,
  id: string,
  patch: Partial<RedemptionRequest>
) {
  set((state) => ({
    redemptions: state.redemptions.map((r) =>
      r.id === id ? { ...r, ...patch } : r
    ),
  }))
}

export const useRedemptionsStore = create<RedemptionsState>()(
  persist(
    (set) => ({
      redemptions: seedRedemptions(),
      approveRedemption: (id, actorRole) => {
        setStatus(set, id, {
          status: 'Disetujui',
          approvedAt: new Date().toISOString(),
        })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Menyetujui request penukaran KopPoin',
          module: 'pos',
          targetId: id,
        })
      },
      rejectRedemption: (id, actorRole) => {
        setStatus(set, id, { status: 'Ditolak' })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Bendahara',
          action: 'Menolak request penukaran KopPoin',
          module: 'pos',
          targetId: id,
        })
      },
      executeRedemption: (id, actorRole) => {
        setStatus(set, id, {
          status: 'Dieksekusi',
          executedAt: new Date().toISOString(),
        })
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Kasir',
          action: 'Mengeksekusi penukaran KopPoin (poin terpotong dari saldo anggota)',
          module: 'pos',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-redemptions-store' }
  )
)
