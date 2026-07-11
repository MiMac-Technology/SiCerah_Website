import { useState } from 'react'
import { QrCode, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { searchMembers, type MemberLookup } from '../api'

/**
 * Simulasi pemindaian QR kartu anggota. Di produksi tombol ini membuka
 * kamera dan membaca QR berisi no_anggota; di demo, pemindaian disimulasikan
 * dengan memilih anggota aktif secara acak dari hasil pencarian setelah jeda
 * singkat.
 */
export function QrScanButton({
  onScanned,
}: {
  onScanned: (member: MemberLookup) => void
}) {
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)

  const simulateScan = () => {
    setScanning(true)
    searchMembers('')
      .then((members) => {
        const member = members[Math.floor(Math.random() * members.length)]
        setTimeout(() => {
          setScanning(false)
          setOpen(false)
          if (member) {
            onScanned(member)
            toast.success(`QR terbaca: ${member.name} (${member.memberNo})`)
          } else {
            toast.error('Tidak ada anggota aktif')
          }
        }, 1200)
      })
      .catch(() => {
        setScanning(false)
        setOpen(false)
        toast.error('Gagal memindai QR, coba lagi')
      })
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
