import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import { useExpensesStore, type Expense } from '@/stores/expenses-store'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'

type KasKeluarCorrectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Expense
}

export function KasKeluarCorrectionDialog({
  open,
  onOpenChange,
  currentRow,
}: KasKeluarCorrectionDialogProps) {
  const { activeRole } = useRole()
  const addCorrection = useExpensesStore((s) => s.addCorrection)
  const [newAmount, setNewAmount] = useState(String(currentRow.amount))
  const [reason, setReason] = useState('')
  const parsed = Number(newAmount)
  const delta = parsed - currentRow.amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Koreksi {currentRow.expenseNo} (Append-Only)
          </DialogTitle>
          <DialogDescription>
            Entri asli tidak diubah atau dihapus. Sistem membuat entri baru
            berisi selisih yang mereferensi entri salah — keduanya tetap
            tercatat di ledger.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm'>
            Nominal tercatat:{' '}
            <span className='font-medium'>
              {formatCurrency(currentRow.amount)}
            </span>
          </p>
          <div className='space-y-2'>
            <Label htmlFor='kk-correct-amount'>Nominal Seharusnya (Rp)</Label>
            <Input
              id='kk-correct-amount'
              type='number'
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            {!Number.isNaN(parsed) && delta !== 0 && (
              <p className='text-xs text-muted-foreground'>
                Entri koreksi akan dibuat sebesar {formatCurrency(delta)}.
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='kk-correct-reason'>Alasan Koreksi</Label>
            <Textarea
              id='kk-correct-reason'
              placeholder='cth. Nota supplier tertukar'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!reason.trim() || Number.isNaN(parsed) || delta === 0}
            onClick={() => {
              addCorrection(currentRow.id, parsed, reason.trim(), activeRole)
              toast.success('Entri koreksi ditambahkan ke ledger')
              onOpenChange(false)
            }}
          >
            Buat Entri Koreksi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
