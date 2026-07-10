import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { ROLE_LABELS } from '@/config/roles'

export type VoterRole = 'bendahara' | 'sekretaris' | 'ketua'
export const VOTER_ROLES: VoterRole[] = ['bendahara', 'sekretaris', 'ketua']

export type Vote = {
  role: VoterRole
  voterLabel: string
  decision: 'setuju' | 'tolak'
  comment?: string
  timestamp: string
}

export type ApprovalStatus = 'Berjalan' | 'Disetujui' | 'Ditolak'

export type ApprovalRequest = {
  id: string
  title: string
  sourceModule: 'kas-keluar'
  sourceId: string
  amount: number
  description: string
  proofPhotoDataUrl?: string
  status: ApprovalStatus
  votes: Vote[]
  createdAt: string
  finalDecisionBy?: string
  finalDecisionAt?: string
}

export type CreateApprovalInput = {
  title: string
  sourceId: string
  amount: number
  description: string
  proofPhotoDataUrl?: string
}

type ApprovalsState = {
  approvals: ApprovalRequest[]
  createApprovalRequest: (data: CreateApprovalInput) => ApprovalRequest
  castVote: (
    id: string,
    vote: { role: VoterRole; decision: 'setuju' | 'tolak'; comment?: string }
  ) => void
  finalizeApproval: (
    id: string,
    decision: 'Disetujui' | 'Ditolak',
    executedBy: string
  ) => void
}

export function getQuorumMet(approval: ApprovalRequest): boolean {
  return VOTER_ROLES.every((role) =>
    approval.votes.some((v) => v.role === role)
  )
}

function seedApprovals(): ApprovalRequest[] {
  faker.seed(5005)
  return Array.from({ length: 3 }, (_, i) => {
    const votes: Vote[] = i === 0 ? [] : [
      {
        role: 'bendahara',
        voterLabel: `${ROLE_LABELS.bendahara} ${faker.person.firstName()}`,
        decision: 'setuju',
        comment: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 5 }).toISOString(),
      },
    ]
    return {
      id: genId('appr'),
      title: `Pengeluaran ${faker.commerce.department()}`,
      sourceModule: 'kas-keluar' as const,
      sourceId: genId('seed-expense'),
      amount: faker.number.int({ min: 2_500_000, max: 15_000_000 }),
      description: faker.lorem.sentence({ min: 6, max: 12 }),
      proofPhotoDataUrl: undefined,
      status: 'Berjalan' as const,
      votes,
      createdAt: faker.date.recent({ days: 10 }).toISOString(),
    }
  })
}

export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      approvals: seedApprovals(),
      createApprovalRequest: (data) => {
        const approval: ApprovalRequest = {
          ...data,
          id: genId('appr'),
          sourceModule: 'kas-keluar',
          status: 'Berjalan',
          votes: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ approvals: [approval, ...state.approvals] }))
        return approval
      },
      castVote: (id, vote) => {
        const voterLabel = `${ROLE_LABELS[vote.role]}`
        set((state) => ({
          approvals: state.approvals.map((a) => {
            if (a.id !== id) return a
            const votes = [
              ...a.votes.filter((v) => v.role !== vote.role),
              { ...vote, voterLabel, timestamp: new Date().toISOString() },
            ]
            return { ...a, votes }
          }),
        }))
        useAuditStore.getState().logAction({
          activeRole: vote.role,
          actorLabel: voterLabel,
          action: `Memberikan suara "${vote.decision}" pada approval`,
          module: 'approval',
          targetId: id,
          detail: vote.comment,
        })
      },
      finalizeApproval: (id, decision, executedBy) => {
        const approval = get().approvals.find((a) => a.id === id)
        if (!approval) return
        set((state) => ({
          approvals: state.approvals.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: decision,
                  finalDecisionBy: executedBy,
                  finalDecisionAt: new Date().toISOString(),
                }
              : a
          ),
        }))
        useExpensesStore.getState().setExpenseStatus(approval.sourceId, decision)
        useAuditStore.getState().logAction({
          activeRole: 'ketua',
          actorLabel: executedBy,
          action: `Memfinalisasi approval: ${decision}`,
          module: 'approval',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-approvals-store' }
  )
)
