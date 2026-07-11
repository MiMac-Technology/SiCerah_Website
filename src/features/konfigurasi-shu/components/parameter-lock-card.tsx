import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Lock, LockOpen } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
import { closeFiscalYear, lockShuParameter, type FiscalYear } from '../api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'

export function ParameterLockCard({
  fiscalYear,
  isKetua,
}: {
  fiscalYear: FiscalYear
  isKetua: boolean
}) {
  const queryClient = useQueryClient()
  const [lockOpen, setLockOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const param = fiscalYear.shu_parameter
  const locked = param?.is_locked ?? false

  const lockMutation = useMutation({
    mutationFn: () => lockShuParameter(fiscalYear.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tahun-buku'] })
      toast.success('Parameter SHU dikunci pasca-RAT')
      setLockOpen(false)
    },
    onError: handleServerError,
  })

  const closeMutation = useMutation({
    mutationFn: () => closeFiscalYear(fiscalYear.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tahun-buku'] })
      toast.success('Tahun buku ditutup — SHU final sudah dihitung per anggota')
      setCloseOpen(false)
    },
    onError: handleServerError,
  })

  return (
    <Card className={locked ? 'border-amber-500/50 bg-amber-500/5' : ''}>
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              {locked ? (
                <Lock className='size-4 text-amber-600 dark:text-amber-400' />
              ) : (
                <LockOpen className='size-4' />
              )}
              Lock Parameter Tahunan — {fiscalYear.name}
            </CardTitle>
            <CardDescription>
              {locked
                ? `Dikunci pada ${formatDateTime(param!.locked_at!)} — parameter tidak bisa diubah. Untuk mengubahnya, tutup tahun buku ini dan buat tahun buku baru.`
                : 'Setelah RAT, Ketua mengunci parameter SHU agar tidak dapat diubah siapa pun sampai tahun buku ini ditutup.'}
            </CardDescription>
          </div>
          {isKetua && !locked && (
            <Button onClick={() => setLockOpen(true)} disabled={!param}>
              <Lock className='size-4' /> Kunci Parameter
            </Button>
          )}
          {isKetua && locked && fiscalYear.status === 'open' && (
            <Button variant='outline' onClick={() => setCloseOpen(true)}>
              Tutup Tahun Buku
            </Button>
          )}
        </div>
      </CardHeader>
      {!param && (
        <CardContent className='pt-0 text-sm text-muted-foreground'>
          Isi dan simpan parameter SHU di bawah terlebih dahulu sebelum bisa dikunci.
        </CardContent>
      )}
      {!isKetua && locked && (
        <CardContent className='pt-0 text-sm text-muted-foreground'>
          Hanya Ketua/Admin yang dapat menutup tahun buku ini.
        </CardContent>
      )}

      <ConfirmDialog
        open={lockOpen}
        onOpenChange={setLockOpen}
        title='Kunci Parameter Tahunan?'
        desc='Parameter SHU akan terkunci untuk seluruh pengurus sampai tahun buku ini ditutup. Aksi ini tercatat di audit trail.'
        confirmText='Kunci'
        cancelBtnText='Batal'
        handleConfirm={() => lockMutation.mutate()}
      />

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title='Tutup tahun buku ini?'
        desc='SHU final akan dihitung untuk setiap anggota berdasarkan parameter yang sudah dikunci. Aksi ini tidak bisa dibatalkan.'
        confirmText='Tutup Tahun Buku'
        cancelBtnText='Batal'
        handleConfirm={() => closeMutation.mutate()}
      />
    </Card>
  )
}
