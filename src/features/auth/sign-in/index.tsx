import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Masuk</CardTitle>
          <CardDescription>
            Masukkan email dan password akun pengurus Anda. Akun pengurus
            dibuat oleh Administrator — hubungi Administrator koperasi Anda
            jika belum punya akun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
