import { useState } from 'react'
import { QrCode, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { useMembersStore } from '@/stores/members-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Simulasi pemindaian QR kartu anggota. Di produksi tombol ini membuka
 * kamera dan membaca QR berisi memberNo; di demo, pemindaian disimulasikan
 * dengan memilih anggota aktif secara acak setelah jeda singkat.
 */
export function QrScanButton({
  onScanned,
}: {
  onScanned: (memberId: string) => void
}) {
  const members = useMembersStore((s) => s.members)
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)

  const simulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      const active = members.filter((m) => m.status === 'aktif')
      const member = active[Math.floor(Math.random() * active.length)]
      setScanning(false)
      setOpen(false)
      if (member) {
        onScanned(member.id)
        toast.success(`QR terbaca: ${member.fullName} (${member.memberNo})`)
      } else {
        toast.error('Tidak ada anggota aktif')
      }
    }, 1200)
  }

  return (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => {
          setOpen(true)
          simulateScan()
        }}
      >
        <QrCode className='size-4' /> Scan QR
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-xs'>
          <DialogHeader>
            <DialogTitle>Memindai QR Anggota</DialogTitle>
            <DialogDescription>
              Arahkan kamera ke QR pada kartu / aplikasi anggota.
            </DialogDescription>
          </DialogHeader>
          <div className='flex h-40 items-center justify-center rounded-md border border-dashed'>
            <ScanLine
              className={`size-16 text-muted-foreground ${scanning ? 'animate-pulse' : ''}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
