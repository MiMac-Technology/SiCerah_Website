import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SignaturePadFieldProps = {
  onSave: (dataUrl: string) => void
  disabled?: boolean
}

export function SignaturePadField({ onSave, disabled }: SignaturePadFieldProps) {
  const padRef = useRef<SignatureCanvas>(null)

  const clear = () => padRef.current?.clear()

  const save = () => {
    if (!padRef.current || padRef.current.isEmpty()) return
    onSave(padRef.current.getTrimmedCanvas().toDataURL('image/png'))
  }

  return (
    <div className='space-y-2'>
      <div className='rounded-md border border-dashed bg-white'>
        <SignatureCanvas
          ref={padRef}
          penColor='black'
          canvasProps={{ className: 'h-32 w-full' }}
        />
      </div>
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={disabled}
          onClick={clear}
        >
          <Eraser className='size-4' /> Hapus
        </Button>
        <Button type='button' size='sm' disabled={disabled} onClick={save}>
          Simpan Tanda Tangan
        </Button>
      </div>
    </div>
  )
}
