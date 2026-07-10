import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuditStore } from '@/stores/audit-store'
import { ROLE_LABELS, type Role } from '@/config/roles'

export type DelegationScope = 'pinjaman' | 'pengeluaran' | 'semua'

export const SCOPE_LABELS: Record<DelegationScope, string> = {
  pinjaman: 'Approval Pinjaman',
  pengeluaran: 'Approval Pengeluaran Besar',
  semua: 'Semua Approval',
}

export type Delegation = {
  delegateRole: Role
  scope: DelegationScope
  until: string
  createdAt: string
}

type DelegationState = {
  delegation: Delegation | null
  setDelegation: (delegateRole: Role, scope: DelegationScope, until: string) => void
  revokeDelegation: () => void
}

/** True jika `role` sedang memegang hak approval Ketua untuk `scope` tersebut. */
export function isDelegateFor(
  delegation: Delegation | null,
  role: Role,
  scope: Exclude<DelegationScope, 'semua'>
): boolean {
  if (!delegation) return false
  if (new Date(delegation.until) < new Date()) return false
  if (delegation.delegateRole !== role) return false
  return delegation.scope === 'semua' || delegation.scope === scope
}

export const useDelegationStore = create<DelegationState>()(
  persist(
    (set) => ({
      delegation: null,
      setDelegation: (delegateRole, scope, until) => {
        set({
          delegation: {
            delegateRole,
            scope,
            until,
            createdAt: new Date().toISOString(),
          },
        })
        useAuditStore.getState().logAction({
          activeRole: 'ketua',
          actorLabel: 'Ketua',
          action: `Mendelegasikan ${SCOPE_LABELS[scope]} ke ${ROLE_LABELS[delegateRole]}`,
          module: 'approval',
          detail: `Berlaku hingga ${new Date(until).toLocaleString('id-ID')}`,
        })
      },
      revokeDelegation: () => {
        set({ delegation: null })
        useAuditStore.getState().logAction({
          activeRole: 'ketua',
          actorLabel: 'Ketua',
          action: 'Mencabut delegasi approval',
          module: 'approval',
        })
      },
    }),
    { name: 'sicerah-delegation-store' }
  )
)
