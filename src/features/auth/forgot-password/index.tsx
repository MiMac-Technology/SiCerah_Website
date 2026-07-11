import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

// Catatan: backend belum punya endpoint reset password (belum ada
// POST /forgot-password / verifikasi token). Form ini masih placeholder UI.
export function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Lupa Password
          </CardTitle>
          <CardDescription>
            Masukkan email terdaftar Anda, <br /> kami akan mengirimkan link
            untuk mengatur ulang password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
