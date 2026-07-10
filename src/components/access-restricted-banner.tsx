import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ROLE_LABELS, type Role } from '@/config/roles'

export function AccessRestrictedBanner({ activeRole }: { activeRole: Role }) {
  return (
    <Alert variant='destructive' className='mb-4'>
      <ShieldAlert />
      <AlertTitle>Akses terbatas untuk role ini</AlertTitle>
      <AlertDescription>
        Anda melihat halaman ini sebagai <strong>{ROLE_LABELS[activeRole]}</strong>.
        Input dan aksi pada halaman ini dinonaktifkan.
      </AlertDescription>
    </Alert>
  )
}
