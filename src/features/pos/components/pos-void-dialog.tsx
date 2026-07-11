import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
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
import { requestVoidSale } from '../api'
import { usePos } from './pos-provider'

export function PosVoidDialog() {
  const { open, setOpen, currentTransaction, setCurrentTransaction } = usePos()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const requestVoidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      requestVoidSale(id, reason),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'penjualan'] })
      toast.success(`Pengajuan void ${sale.trxNo} dikirim ke Bendahara`)
      close()
    },
    onError: handleServerError,
  })

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
            disabled={!reason.trim() || requestVoidMutation.isPending}
            onClick={() =>
              requestVoidMutation.mutate({ id: trx.id, reason: reason.trim() })
            }
          >
            Ajukan Void
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
