import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export type AnnouncementCategory =
  | 'Keuangan'
  | 'RAT'
  | 'Kegiatan'
  | 'Pengeluaran Besar'
  | 'Umum'

export type AnnouncementChannel = 'in-app' | 'wa' | 'keduanya'

export const CHANNEL_LABELS: Record<AnnouncementChannel, string> = {
  'in-app': 'Notif In-App',
  wa: 'WA Blast',
  keduanya: 'In-App + WA',
}

export type Announcement = {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  photoDataUrl?: string
  published: boolean
  authorRole: Role
  channel?: AnnouncementChannel
  /** Jika diisi dan masih di masa depan, pengumuman berstatus terjadwal. */
  scheduledAt?: string
  readCount?: number
  totalRecipients?: number
  reminderSentAt?: string
  createdAt: string
  updatedAt: string
}

export type AnnouncementInput = Pick<
  Announcement,
  'title' | 'content' | 'category' | 'photoDataUrl' | 'channel' | 'scheduledAt'
>

type AnnouncementsState = {
  announcements: Announcement[]
  createAnnouncement: (data: AnnouncementInput, actorRole: Role) => void
  updateAnnouncement: (
    id: string,
    data: AnnouncementInput,
    actorRole: Role
  ) => void
  togglePublish: (id: string, actorRole: Role) => void
  deleteAnnouncement: (id: string, actorRole: Role) => void
  /** Kirim reminder ke anggota yang belum membaca (simulasi WA/in-app). */
  sendReadReminder: (id: string, actorRole: Role) => void
}

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  'Keuangan',
  'RAT',
  'Kegiatan',
  'Pengeluaran Besar',
  'Umum',
]

function seedAnnouncements(): Announcement[] {
  faker.seed(3003)
  return Array.from({ length: 10 }, () => {
    const createdAt = faker.date.recent({ days: 90 })
    return {
      id: genId('ann'),
      title: faker.lorem.sentence({ min: 4, max: 8 }),
      content: faker.lorem.paragraphs({ min: 1, max: 2 }),
      category: faker.helpers.arrayElement(ANNOUNCEMENT_CATEGORIES),
      photoDataUrl: undefined,
      published: faker.datatype.boolean(0.8),
      authorRole: 'sekretaris' as const,
      channel: faker.helpers.arrayElement<AnnouncementChannel>([
        'in-app',
        'wa',
        'keduanya',
      ]),
      readCount: faker.number.int({ min: 3, max: 28 }),
      totalRecipients: 30,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    }
  })
}

export const useAnnouncementsStore = create<AnnouncementsState>()(
  persist(
    (set) => ({
      announcements: seedAnnouncements(),
      createAnnouncement: (data, actorRole) => {
        const now = new Date().toISOString()
        const isScheduled =
          !!data.scheduledAt && new Date(data.scheduledAt) > new Date()
        const announcement: Announcement = {
          ...data,
          id: genId('ann'),
          published: !isScheduled,
          authorRole: actorRole,
          readCount: 0,
          totalRecipients: 30,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          announcements: [announcement, ...state.announcements],
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Membuat pengumuman',
          module: 'pengumuman',
          targetId: announcement.id,
          detail: announcement.title,
        })
      },
      updateAnnouncement: (id, data, actorRole) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id
              ? { ...a, ...data, updatedAt: new Date().toISOString() }
              : a
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Mengubah pengumuman',
          module: 'pengumuman',
          targetId: id,
        })
      },
      togglePublish: (id, actorRole) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  published: !a.published,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Mengubah status publikasi pengumuman',
          module: 'pengumuman',
          targetId: id,
        })
      },
      sendReadReminder: (id, actorRole) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id
              ? { ...a, reminderSentAt: new Date().toISOString() }
              : a
          ),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Mengirim reminder pengumuman ke anggota yang belum membaca',
          module: 'pengumuman',
          targetId: id,
        })
      },
      deleteAnnouncement: (id, actorRole) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Menghapus pengumuman',
          module: 'pengumuman',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-announcements-store' }
  )
)
