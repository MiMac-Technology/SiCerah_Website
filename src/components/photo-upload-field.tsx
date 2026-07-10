import { useId, useRef } from 'react'
import { ImageUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type PhotoUploadFieldProps = {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  accept?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function PhotoUploadField({
  value,
  onChange,
  accept = 'image/*',
  description,
  disabled,
  className,
}: PhotoUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className={cn('flex items-start gap-3', className)}>
      {value ? (
        <div className='relative'>
          <img
            src={value}
            alt='Pratinjau foto'
            className='size-24 rounded-md border object-cover'
          />
          {!disabled && (
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute -top-2 -end-2 size-6 rounded-full'
              onClick={() => {
                onChange(undefined)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <X className='size-3' />
            </Button>
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-accent'
          )}
        >
          <ImageUp className='size-5' />
          <span className='text-xs'>Unggah</span>
        </label>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type='file'
        accept={accept}
        disabled={disabled}
        className='hidden'
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {description && (
        <p className='self-center text-xs text-muted-foreground'>
          {description}
        </p>
      )}
    </div>
  )
}
