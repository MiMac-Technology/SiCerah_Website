import { faker } from '@faker-js/faker'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '@/lib/id'
import { useAuditStore } from '@/stores/audit-store'
import { type Role } from '@/config/roles'

export const DOCUMENT_CATEGORIES = [
  'AD/ART',
  'SK Pendirian',
  'Notulensi RAT',
  'SK Pengurus',
  'Lainnya',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export type KoperasiDocument = {
  id: string
  name: string
  category: DocumentCategory
  fileName: string
  /** Ukuran file dalam byte. Konten PDF tidak disimpan di localStorage (metadata saja untuk demo). */
  fileSize: number
  uploadedBy: string
  uploadedAt: string
}

export type DocumentInput = Pick<
  KoperasiDocument,
  'name' | 'category' | 'fileName' | 'fileSize'
>

type DocumentsState = {
  documents: KoperasiDocument[]
  addDocument: (data: DocumentInput, actorRole: Role) => void
  deleteDocument: (id: string, actorRole: Role) => void
}

function seedDocuments(): KoperasiDocument[] {
  faker.seed(1515)
  const docs: { name: string; category: DocumentCategory }[] = [
    { name: 'Anggaran Dasar & Anggaran Rumah Tangga', category: 'AD/ART' },
    { name: 'SK Pendirian Koperasi Sejahtera', category: 'SK Pendirian' },
    { name: 'Notulensi RAT Tahun Buku 2025', category: 'Notulensi RAT' },
    { name: 'SK Pengangkatan Pengurus 2026-2029', category: 'SK Pengurus' },
  ]
  return docs.map((d) => ({
    ...d,
    id: genId('doc'),
    fileName: `${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
    fileSize: faker.number.int({ min: 150_000, max: 4_000_000 }),
    uploadedBy: 'Sekretaris',
    uploadedAt: faker.date.past({ years: 1 }).toISOString(),
  }))
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set) => ({
      documents: seedDocuments(),
      addDocument: (data, actorRole) => {
        const doc: KoperasiDocument = {
          ...data,
          id: genId('doc'),
          uploadedBy: 'Sekretaris',
          uploadedAt: new Date().toISOString(),
        }
        set((state) => ({ documents: [doc, ...state.documents] }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: `Mengarsipkan dokumen (${data.category})`,
          module: 'pengumuman',
          targetId: doc.id,
          detail: data.name,
        })
      },
      deleteDocument: (id, actorRole) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }))
        useAuditStore.getState().logAction({
          activeRole: actorRole,
          actorLabel: 'Sekretaris',
          action: 'Menghapus dokumen dari arsip',
          module: 'pengumuman',
          targetId: id,
        })
      },
    }),
    { name: 'sicerah-documents-store' }
  )
)
