import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { STAFF_ROLE_LABELS, type StaffRole } from '@/config/roles'

export type AccountStatus = 'aktif' | 'nonaktif'

export type StaffAccount = {
  id: string
  name: string
  email: string
  phone: string
  role: StaffRole
  status: AccountStatus
  createdAt: string
}

export type StaffAccountInput = Pick<
  StaffAccount,
  'name' | 'email' | 'phone' | 'role'
>

type AccountsState = {
  accounts: StaffAccount[]
  createAccount: (data: StaffAccountInput) => void
  updateAccount: (id: string, data: StaffAccountInput) => void
  setAccountStatus: (id: string, status: AccountStatus) => void
}

function seedAccounts(): StaffAccount[] {
  faker.seed(7007)
  const roles: StaffRole[] = [
    'kasir',
    'bendahara',
    'logistik',
    'sekretaris',
    'pengawas',
  ]
  return roles.map((role) => {
    const name = faker.person.fullName()
    return {
      id: genId('acct'),
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: `08${faker.string.numeric(10)}`,
      role,
      status: 'aktif' as const,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    }
  })
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      accounts: seedAccounts(),
      createAccount: (data) => {
        const account: StaffAccount = {
          ...data,
          id: genId('acct'),
          status: 'aktif',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ accounts: [account, ...state.accounts] }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: `Membuat akun pengurus (${STAFF_ROLE_LABELS[data.role]})`,
          module: 'admin',
          targetId: account.id,
          detail: account.name,
        })
      },
      updateAccount: (id, data) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: 'Mengubah akun pengurus',
          module: 'admin',
          targetId: id,
          detail: data.name,
        })
      },
      setAccountStatus: (id, status) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: 'admin',
          actorLabel: 'Administrator',
          action: `Mengubah status akun menjadi ${status}`,
          module: 'admin',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-accounts-store' }
  )
)
