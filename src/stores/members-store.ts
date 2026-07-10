import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type MemberStatus = 'aktif' | 'nonaktif'

export type Member = {
  id: string
  memberNo: string
  fullName: string
  nik: string
  address: string
  domicileAddress?: string
  /** Locked once registered — no update action exists, by design (anti-substitution). */
  phone: string
  ktpPhotoDataUrl: string
  birthDate: string
  joinDate: string
  status: MemberStatus
  createdAt: string
}

export type RegisterMemberInput = Omit<
  Member,
  'id' | 'memberNo' | 'joinDate' | 'status' | 'createdAt'
>

type MembersState = {
  members: Member[]
  registerMember: (data: RegisterMemberInput, actorRole: Role) => Member
  updateMemberProfile: (
    id: string,
    data: Partial<Pick<Member, 'address' | 'domicileAddress' | 'nik' | 'fullName' | 'birthDate'>>,
    actorRole: Role
  ) => void
  setMemberStatus: (id: string, status: MemberStatus, actorRole: Role) => void
}

const AGE_BRACKETS = [
  { label: '<25', min: 0, max: 24 },
  { label: '25-34', min: 25, max: 34 },
  { label: '35-44', min: 35, max: 44 },
  { label: '45-54', min: 45, max: 54 },
  { label: '55+', min: 55, max: 200 },
]

export function getAge(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

export function getAgeBracket(birthDate: string): string {
  const age = getAge(birthDate)
  return AGE_BRACKETS.find((b) => age >= b.min && age <= b.max)?.label ?? '55+'
}

function seedMembers(): Member[] {
  faker.seed(2002)
  return Array.from({ length: 30 }, (_, i) => {
    const joinDate = faker.date.past({ years: 4 })
    return {
      id: genId('member'),
      memberNo: `A-${String(i + 1).padStart(4, '0')}`,
      fullName: faker.person.fullName(),
      nik: faker.string.numeric(16),
      address: faker.location.streetAddress({ useFullAddress: true }),
      domicileAddress: undefined,
      phone: `08${faker.string.numeric(10)}`,
      ktpPhotoDataUrl: '',
      birthDate: faker.date
        .birthdate({ min: 20, max: 65, mode: 'age' })
        .toISOString(),
      joinDate: joinDate.toISOString(),
      status: faker.helpers.weightedArrayElement([
        { value: 'aktif', weight: 7 },
        { value: 'nonaktif', weight: 3 },
      ]),
      createdAt: joinDate.toISOString(),
    }
  })
}

export const useMembersStore = create<MembersState>()(
  persist(
    (set, get) => ({
      members: seedMembers(),
      registerMember: (data, actorRole) => {
        const member: Member = {
          ...data,
          id: genId('member'),
          memberNo: `A-${String(get().members.length + 1).padStart(4, '0')}`,
          joinDate: new Date().toISOString(),
          status: 'aktif',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ members: [member, ...state.members] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Meregistrasi anggota baru',
          module: 'anggota',
          targetId: member.id,
          detail: `${member.fullName} (${member.memberNo})`,
        })
        return member
      },
      updateMemberProfile: (id, data, actorRole) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Memperbarui data anggota',
          module: 'anggota',
          targetId: id,
        })
      },
      setMemberStatus: (id, status, actorRole) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, status } : m
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: `Mengubah status anggota menjadi ${status}`,
          module: 'anggota',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-members-store' }
  )
)
