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

export type Announcement = {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  photoDataUrl?: string
  published: boolean
  authorRole: Role
  createdAt: string
  updatedAt: string
}

export type AnnouncementInput = Pick<
  Announcement,
  'title' | 'content' | 'category' | 'photoDataUrl'
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
      authorRole: 'sekretaris',
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
        const announcement: Announcement = {
          ...data,
          id: genId('ann'),
          published: true,
          authorRole: actorRole,
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
