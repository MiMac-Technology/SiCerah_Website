import { useState } from 'react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import { useRole } from '@/context/role-provider'
import {
  useMembersStore,
  type Member,
  type MemberStatus,
} from '@/stores/members-store'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export const STATUS_LABELS: Record<MemberStatus, string> = {
  aktif: 'Aktif',
  pasif: 'Pasif',
  keluar: 'Keluar',
}

export const STATUS_VARIANTS: Record<
  MemberStatus,
  'default' | 'secondary' | 'destructive'
> = {
  aktif: 'default',
  pasif: 'secondary',
  keluar: 'destructive',
}

type AnggotaStatusDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentRow: Member
}

export function AnggotaStatusDialog({
  open,
  onOpenChange,
  currentRow,
}: AnggotaStatusDialogProps) {
  const { activeRole } = useRole()
  const setMemberStatus = useMembersStore((s) => s.setMemberStatus)
  const [status, setStatus] = useState<MemberStatus>(currentRow.status)
  const [reason, setReason] = useState('')
  const history = currentRow.statusHistory ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Ubah Status Keanggotaan</DialogTitle>
          <DialogDescription>
            {currentRow.fullName} ({currentRow.memberNo}) — setiap perubahan
            tercatat lengkap dengan alasannya.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Status Baru</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as MemberStatus)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='aktif'>Aktif</SelectItem>
                <SelectItem value='pasif'>Pasif</SelectItem>
                <SelectItem value='keluar'>Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='status-reason'>Alasan Perubahan</Label>
            <Textarea
              id='status-reason'
              placeholder='cth. Tidak aktif bertransaksi selama 6 bulan'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {history.length > 0 && (
            <div className='space-y-2'>
              <Label>Riwayat Perubahan Status</Label>
              <div className='max-h-40 space-y-2 overflow-y-auto rounded-md border p-2'>
                {history.map((h, i) => (
                  <div key={i} className='flex items-start gap-2 text-sm'>
                    <Badge variant={STATUS_VARIANTS[h.status]}>
                      {STATUS_LABELS[h.status]}
                    </Badge>
                    <div className='min-w-0'>
                      <p className='truncate'>{h.reason}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDateTime(h.changedAt)} — {h.changedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!reason.trim() || status === currentRow.status}
            onClick={() => {
              setMemberStatus(currentRow.id, status, reason.trim(), activeRole)
              toast.success(
                `Status ${currentRow.fullName} diubah menjadi ${STATUS_LABELS[status]}`
              )
              onOpenChange(false)
            }}
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
