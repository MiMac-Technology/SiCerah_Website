import { useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import { useShuConfigStore } from '@/stores/shu-config-store'
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
import { ConfirmDialog } from '@/components/confirm-dialog'

export function ParameterLockCard({ isKetua }: { isKetua: boolean }) {
  const config = useShuConfigStore((s) => s.config)
  const lockParameters = useShuConfigStore((s) => s.lockParameters)
  const unlockParameters = useShuConfigStore((s) => s.unlockParameters)
  const [lockOpen, setLockOpen] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)
  const [untilLabel, setUntilLabel] = useState(
    `RAT ${config.fiscalYear + 1}`
  )

  return (
    <Card
      className={config.locked ? 'border-amber-500/50 bg-amber-500/5' : ''}
    >
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              {config.locked ? (
                <Lock className='size-4 text-amber-600 dark:text-amber-400' />
              ) : (
                <LockOpen className='size-4' />
              )}
              Lock Parameter Tahunan
            </CardTitle>
            <CardDescription>
              {config.locked
                ? `Dikunci ${config.lockedBy} pada ${formatDateTime(config.lockedAt!)} — tidak ada pengurus yang dapat mengubah parameter hingga ${config.lockedUntilLabel}.`
                : 'Setelah RAT, Ketua mengunci parameter SHU & anggaran tahunan agar tidak dapat diubah siapa pun sampai RAT berikutnya.'}
            </CardDescription>
          </div>
          {isKetua &&
            (config.locked ? (
              <Button variant='outline' onClick={() => setUnlockOpen(true)}>
                <LockOpen className='size-4' /> Buka Kunci (Pasca-RAT)
              </Button>
            ) : (
              <Button onClick={() => setLockOpen(true)}>
                <Lock className='size-4' /> Kunci Parameter
              </Button>
            ))}
        </div>
      </CardHeader>
      {!isKetua && config.locked && (
        <CardContent className='pt-0 text-sm text-muted-foreground'>
          Hanya Ketua yang dapat membuka kunci ini.
        </CardContent>
      )}

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Kunci Parameter Tahunan?</DialogTitle>
            <DialogDescription>
              Parameter SHU dan ambang batas anggaran akan terkunci untuk
              seluruh pengurus. Aksi ini tercatat di audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='until-label'>Berlaku Hingga</Label>
            <Input
              id='until-label'
              value={untilLabel}
              onChange={(e) => setUntilLabel(e.target.value)}
              placeholder='cth. RAT 2027'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setLockOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!untilLabel.trim()}
              onClick={() => {
                lockParameters(untilLabel.trim())
                toast.success('Parameter tahunan dikunci')
                setLockOpen(false)
              }}
            >
              <Lock className='size-4' /> Kunci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        title='Buka kunci parameter?'
        desc='Lakukan hanya setelah RAT berikutnya digelar. Pembukaan kunci tercatat di audit trail.'
        confirmText='Buka Kunci'
        cancelBtnText='Batal'
        handleConfirm={() => {
          unlockParameters()
          toast.success('Kunci parameter dibuka')
          setUnlockOpen(false)
        }}
      />
    </Card>
  )
}
