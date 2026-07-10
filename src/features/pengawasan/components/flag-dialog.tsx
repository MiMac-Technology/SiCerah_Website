import { useState } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAuditFlagsStore,
  type FlagTargetType,
} from '@/stores/audit-flags-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type FlagTarget = {
  type: FlagTargetType
  id: string
  label: string
}

export function FlagDialog({
  target,
  onClose,
}: {
  target: FlagTarget
  onClose: () => void
}) {
  const addFlag = useAuditFlagsStore((s) => s.addFlag)
  const [note, setNote] = useState('')

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Transaksi Mencurigakan</DialogTitle>
          <DialogDescription>
            {target.label} — catatan audit bersifat read-add only dan tidak
            dapat dihapus oleh siapa pun.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='flag-note'>Catatan Audit</Label>
          <Textarea
            id='flag-note'
            placeholder='cth. Nominal tidak wajar dibanding transaksi sejenis'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            variant='destructive'
            disabled={!note.trim()}
            onClick={() => {
              addFlag(target.type, target.id, target.label, note.trim())
              toast.success('Transaksi ditandai untuk audit')
              onClose()
            }}
          >
            <Flag className='size-4' /> Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
