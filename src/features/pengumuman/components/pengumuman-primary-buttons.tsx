import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePengumuman } from './pengumuman-provider'

export function PengumumanPrimaryButtons({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { setOpen } = usePengumuman()
  return (
    <Button disabled={disabled} onClick={() => setOpen('create')}>
      <Plus />
      <span>Buat Pengumuman</span>
    </Button>
  )
}
