import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKasKeluar } from './kas-keluar-provider'

export function KasKeluarPrimaryButtons({ disabled }: { disabled?: boolean }) {
  const { setOpen } = useKasKeluar()
  return (
    <div className='flex gap-2'>
      <Button disabled={disabled} onClick={() => setOpen('create')}>
        <Plus className='size-4' />
        Catat Pengeluaran
      </Button>
    </div>
  )
}
