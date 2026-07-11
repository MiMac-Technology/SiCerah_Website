import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

/**
 * Catatan: dashboard web ini untuk pengurus (akun dibuat Administrator lewat
 * Manajemen Akun Pengurus, bukan self-register). Halaman ini tidak lagi
 * ditautkan dari alur Masuk utama, dan belum tersambung ke API register
 * backend (POST /register khusus registrasi anggota untuk mobile app).
 */
export function SignUp() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Buat Akun</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk membuat akun. <br />
            Sudah punya akun?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Masuk
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
