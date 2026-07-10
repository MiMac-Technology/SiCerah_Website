import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnggota } from './anggota-provider'

type AnggotaPrimaryButtonsProps = {
  disabled: boolean
}

export function AnggotaPrimaryButtons({ disabled }: AnggotaPrimaryButtonsProps) {
  const { setOpen } = useAnggota()
  return (
    <div className='flex gap-2'>
      <Button disabled={disabled} onClick={() => setOpen('register')}>
        <Plus className='me-2 size-4' />
        Registrasi Anggota Baru
      </Button>
    </div>
  )
}
