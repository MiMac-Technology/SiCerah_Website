import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

// Catatan: backend belum punya verifikasi OTP/2FA. Halaman ini masih placeholder UI.
export function Otp() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-md gap-4 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            Verifikasi Dua Langkah
          </CardTitle>
          <CardDescription>
            Masukkan kode verifikasi. <br /> Kode telah dikirim ke email Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            Belum menerima kode?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Kirim ulang kode.
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
