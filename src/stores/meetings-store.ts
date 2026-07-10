import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type MeetingStatus = 'Terjadwal' | 'Selesai'

export type Meeting = {
  id: string
  title: string
  agenda: string
  location: string
  scheduledAt: string
  status: MeetingStatus
  invitationSentAt?: string
  /** Daftar id anggota yang hadir (absensi digital). */
  attendeeIds: string[]
  notulensiText?: string
  notulensiUploadedAt?: string
  createdAt: string
}

export type MeetingInput = Pick<
  Meeting,
  'title' | 'agenda' | 'location' | 'scheduledAt'
>

type MeetingsState = {
  meetings: Meeting[]
  createMeeting: (data: MeetingInput, actorRole: Role) => void
  sendInvitations: (id: string, actorRole: Role) => void
  toggleAttendance: (id: string, memberId: string) => void
  uploadNotulensi: (id: string, text: string, actorRole: Role) => void
}

function seedMeetings(): Meeting[] {
  faker.seed(1414)
  return [
    {
      id: genId('meet'),
      title: 'Rapat Anggota Tahunan (RAT) 2026',
      agenda:
        '1. Laporan pertanggungjawaban pengurus\n2. Pembagian SHU tahun buku 2025\n3. Rencana kerja 2026',
      location: 'Balai Desa Sukamaju',
      scheduledAt: faker.date.soon({ days: 14 }).toISOString(),
      status: 'Terjadwal',
      invitationSentAt: faker.date.recent({ days: 2 }).toISOString(),
      attendeeIds: [],
      createdAt: faker.date.recent({ days: 5 }).toISOString(),
    },
    {
      id: genId('meet'),
      title: 'Rapat Pengurus Bulanan — Juni',
      agenda: '1. Evaluasi omzet gerai\n2. Persiapan panen raya',
      location: 'Kantor Koperasi',
      scheduledAt: faker.date.recent({ days: 20 }).toISOString(),
      status: 'Selesai',
      invitationSentAt: faker.date.recent({ days: 25 }).toISOString(),
      attendeeIds: [],
      notulensiText:
        'Omzet gerai naik 12% dibanding bulan lalu. Disepakati penambahan stok pupuk menjelang musim tanam.',
      notulensiUploadedAt: faker.date.recent({ days: 18 }).toISOString(),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    },
  ]
}

export const useMeetingsStore = create<MeetingsState>()(
  persist(
    (set) => ({
      meetings: seedMeetings(),
      createMeeting: (data, actorRole) => {
        const meeting: Meeting = {
          ...data,
          id: genId('meet'),
          status: 'Terjadwal',
          attendeeIds: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ meetings: [meeting, ...state.meetings] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Membuat jadwal rapat',
          module: 'pengumuman',
          targetId: meeting.id,
          detail: meeting.title,
        })
      },
      sendInvitations: (id, actorRole) => {
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id
              ? { ...m, invitationSentAt: new Date().toISOString() }
              : m
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Mengirim undangan rapat (notif in-app + WA blast)',
          module: 'pengumuman',
          targetId: id,
        })
      },
      toggleAttendance: (id, memberId) => {
        set((state) => ({
          meetings: state.meetings.map((m) => {
            if (m.id !== id) return m
            const present = m.attendeeIds.includes(memberId)
            return {
              ...m,
              attendeeIds: present
                ? m.attendeeIds.filter((a) => a !== memberId)
                : [...m.attendeeIds, memberId],
            }
          }),
        }))
      },
      uploadNotulensi: (id, text, actorRole) => {
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id
              ? {
                  ...m,
                  notulensiText: text,
                  notulensiUploadedAt: new Date().toISOString(),
                  status: 'Selesai',
                }
              : m
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Mengunggah notulensi rapat',
          module: 'pengumuman',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-meetings-store' }
  )
)
