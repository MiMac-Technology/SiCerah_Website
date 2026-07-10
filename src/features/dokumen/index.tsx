import { useRef, useState } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  DOCUMENT_CATEGORIES,
  useDocumentsStore,
  type DocumentCategory,
  type KoperasiDocument,
} from '@/stores/documents-store'

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}

function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { activeRole } = useRole()
  const addDocument = useDocumentsStore((s) => s.addDocument)
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('AD/ART')
  const [file, setFile] = useState<File | null>(null)

  const reset = () => {
    setName('')
    setCategory('AD/ART')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Dokumen</DialogTitle>
          <DialogDescription>
            Arsipkan dokumen resmi koperasi dalam format PDF.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='doc-name'>Nama Dokumen</Label>
            <Input
              id='doc-name'
              placeholder='cth. Notulensi RAT 2026'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label>Kategori</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as DocumentCategory)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='doc-file'>File PDF</Label>
            <Input
              id='doc-file'
              ref={fileRef}
              type='file'
              accept='application/pdf'
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className='text-xs text-muted-foreground'>
                {file.name} — {formatSize(file.size)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!name.trim() || !file}
            onClick={() => {
              addDocument(
                {
                  name: name.trim(),
                  category,
                  fileName: file!.name,
                  fileSize: file!.size,
                },
                activeRole
              )
              toast.success('Dokumen diarsipkan')
              onOpenChange(false)
              reset()
            }}
          >
            <Upload className='size-4' /> Arsipkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Dokumen() {
  const { activeRole, hasAccess } = useRoleAccess([
    'sekretaris',
    'ketua',
    'pengawas',
  ])
  const documents = useDocumentsStore((s) => s.documents)
  const deleteDocument = useDocumentsStore((s) => s.deleteDocument)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleting, setDeleting] = useState<KoperasiDocument | null>(null)
  const canManage = hasAccess && activeRole === 'sekretaris'

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Dokumen Koperasi
            </h2>
            <p className='text-muted-foreground'>
              Arsip dokumen resmi: AD/ART, SK pendirian, notulensi RAT, dan SK
              pengurus.
            </p>
          </div>
          <Button disabled={!canManage} onClick={() => setUploadOpen(true)}>
            <Upload className='size-4' /> Upload Dokumen
          </Button>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Card>
          <CardHeader>
            <CardTitle>Arsip Dokumen</CardTitle>
            <CardDescription>
              Dokumen dapat diakses Ketua dan Pengawas secara read-only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dokumen</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Ukuran</TableHead>
                    <TableHead>Diunggah</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length ? (
                    documents.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <FileText className='size-4 shrink-0 text-muted-foreground' />
                            <div className='min-w-0'>
                              <p className='truncate font-medium'>{d.name}</p>
                              <p className='truncate text-xs text-muted-foreground'>
                                {d.fileName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{d.category}</Badge>
                        </TableCell>
                        <TableCell>{formatSize(d.fileSize)}</TableCell>
                        <TableCell>
                          {formatDate(d.uploadedAt)}
                          <span className='block text-xs text-muted-foreground'>
                            {d.uploadedBy}
                          </span>
                        </TableCell>
                        <TableCell>
                          {canManage && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setDeleting(d)}
                            >
                              <Trash2 className='size-4' />
                              <span className='sr-only'>Hapus</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center'>
                        Belum ada dokumen diarsipkan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      {deleting && (
        <ConfirmDialog
          open
          onOpenChange={(v) => !v && setDeleting(null)}
          title='Hapus dokumen?'
          desc={`"${deleting.name}" akan dihapus dari arsip. Aktivitas ini tercatat di audit trail.`}
          destructive
          confirmText='Hapus'
          cancelBtnText='Batal'
          handleConfirm={() => {
            deleteDocument(deleting.id, activeRole)
            toast.success('Dokumen dihapus dari arsip')
            setDeleting(null)
          }}
        />
      )}
    </>
  )
}
