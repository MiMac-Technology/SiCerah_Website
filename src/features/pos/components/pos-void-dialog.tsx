import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import { useTransactionsStore } from '@/stores/transactions-store'
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
import { usePos } from './pos-provider'

export function PosVoidDialog() {
  const { open, setOpen, currentTransaction, setCurrentTransaction } = usePos()
  const { activeRole } = useRole()
  const requestVoid = useTransactionsStore((s) => s.requestVoid)
  const [reason, setReason] = useState('')

  if (!currentTransaction) return null
  const trx = currentTransaction

  const close = () => {
    setOpen(null)
    setReason('')
    setTimeout(() => setCurrentTransaction(null), 500)
  }

  return (
    <Dialog open={open === 'void'} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Void Transaksi</DialogTitle>
          <DialogDescription>
            {trx.trxNo} — {formatCurrency(trx.totalCharged)}. Void membutuhkan
            approval Bendahara; kasir tidak dapat membatalkan transaksi secara
            mandiri.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='void-reason'>Alasan Void</Label>
          <Textarea
            id='void-reason'
            placeholder='cth. Salah input jumlah item'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={close}>
            Batal
          </Button>
          <Button
            disabled={!reason.trim()}
            onClick={() => {
              requestVoid(trx.id, reason.trim(), activeRole)
              toast.success('Pengajuan void dikirim ke Bendahara')
              close()
            }}
          >
            Ajukan Void
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
