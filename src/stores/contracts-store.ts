import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type ContractType = 'beli' | 'jual'
export type ContractStatus = 'Aktif' | 'Selesai'

export type GroupQuota = {
  groupName: string
  targetQty: number
  deliveredQty: number
}

export type ForwardContract = {
  id: string
  contractNo: string
  type: ContractType
  /** Petani/UMKM (beli) atau buyer/pabrik (jual). */
  partnerName: string
  commodity: string
  unit: string
  pricePerUnit: number
  targetQty: number
  deliveredQty: number
  /** Perkiraan panen (beli) atau tenggat pengiriman (jual). */
  dueDate: string
  status: ContractStatus
  /** Hanya kontrak jual: pecahan target ke kuota per kelompok tani. */
  quotas?: GroupQuota[]
  createdAt: string
}

export type AddBuyContractInput = {
  partnerName: string
  commodity: string
  unit: string
  pricePerUnit: number
  targetQty: number
  dueDate: string
}

type ContractsState = {
  contracts: ForwardContract[]
  addBuyContract: (input: AddBuyContractInput, actorRole: Role) => void
  recordDelivery: (
    contractId: string,
    qty: number,
    groupName: string | undefined,
    actorRole: Role
  ) => void
}

function seedContracts(): ForwardContract[] {
  faker.seed(1616)
  const buys: ForwardContract[] = [
    {
      commodity: 'Gabah kering panen',
      unit: 'kg',
      pricePerUnit: 6200,
      targetQty: 2000,
      deliveredQty: 0,
    },
    {
      commodity: 'Kopi robusta',
      unit: 'kg',
      pricePerUnit: 42_000,
      targetQty: 500,
      deliveredQty: 350,
    },
    {
      commodity: 'Jagung pipil',
      unit: 'kg',
      pricePerUnit: 4800,
      targetQty: 1500,
      deliveredQty: 1500,
    },
  ].map((c, i) => ({
    ...c,
    id: genId('fct'),
    contractNo: `FC-B-${String(i + 1).padStart(3, '0')}`,
    type: 'beli' as const,
    partnerName: `${faker.person.fullName()} (Petani ${faker.location.street()})`,
    dueDate: faker.date.soon({ days: 90 }).toISOString(),
    status: (c.deliveredQty >= c.targetQty ? 'Selesai' : 'Aktif') as ContractStatus,
    createdAt: faker.date.recent({ days: 40 }).toISOString(),
  }))

  const sells: ForwardContract[] = [
    {
      partnerName: 'PT Pangan Nusantara (Pabrik Kota)',
      commodity: 'Beras medium',
      unit: 'ton',
      pricePerUnit: 11_500_000,
      targetQty: 20,
      quotas: [
        { groupName: 'Kelompok Tani Makmur', targetQty: 8, deliveredQty: 5 },
        { groupName: 'Kelompok Tani Subur', targetQty: 7, deliveredQty: 3 },
        { groupName: 'Kelompok Tani Harapan', targetQty: 5, deliveredQty: 2 },
      ],
    },
    {
      partnerName: 'CV Kopi Kota (Roastery)',
      commodity: 'Kopi robusta grade A',
      unit: 'kg',
      pricePerUnit: 55_000,
      targetQty: 400,
      quotas: [
        { groupName: 'Kelompok Tani Lereng', targetQty: 250, deliveredQty: 250 },
        { groupName: 'Kelompok Tani Bukit', targetQty: 150, deliveredQty: 120 },
      ],
    },
  ].map((c, i) => {
    const deliveredQty = c.quotas.reduce((s, q) => s + q.deliveredQty, 0)
    return {
      ...c,
      id: genId('fct'),
      contractNo: `FC-J-${String(i + 1).padStart(3, '0')}`,
      type: 'jual' as const,
      deliveredQty,
      dueDate: faker.date.soon({ days: 120 }).toISOString(),
      status: (deliveredQty >= c.targetQty ? 'Selesai' : 'Aktif') as ContractStatus,
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  })

  return [...buys, ...sells]
}

export const useContractsStore = create<ContractsState>()(
  persist(
    (set, get) => ({
      contracts: seedContracts(),
      addBuyContract: (input, actorRole) => {
        const count = get().contracts.filter((c) => c.type === 'beli').length
        const contract: ForwardContract = {
          ...input,
          id: genId('fct'),
          contractNo: `FC-B-${String(count + 1).padStart(3, '0')}`,
          type: 'beli',
          deliveredQty: 0,
          status: 'Aktif',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ contracts: [contract, ...state.contracts] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Logistik',
          action: 'Membuat forward contract beli (kunci harga panen)',
          module: 'logistik',
          targetId: contract.id,
          detail: `${contract.commodity} ${contract.targetQty} ${contract.unit} @ Rp${contract.pricePerUnit.toLocaleString('id-ID')}`,
        })
      },
      recordDelivery: (contractId, qty, groupName, actorRole) => {
        set((state) => ({
          contracts: state.contracts.map((c) => {
            if (c.id !== contractId) return c
            const quotas = groupName
              ? c.quotas?.map((q) =>
                  q.groupName === groupName
                    ? { ...q, deliveredQty: q.deliveredQty + qty }
                    : q
                )
              : c.quotas
            const deliveredQty = quotas
              ? quotas.reduce((s, q) => s + q.deliveredQty, 0)
              : c.deliveredQty + qty
            return {
              ...c,
              quotas,
              deliveredQty,
              status: deliveredQty >= c.targetQty ? 'Selesai' : 'Aktif',
            }
          }),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Logistik',
          action: 'Mencatat setoran/pengiriman forward contract',
          module: 'logistik',
          targetId: contractId,
          detail: groupName ? `${groupName}: +${qty}` : `+${qty}`,
        })
      },
    }),
    { name: 'sicerah-contracts-store' }
  )
)
