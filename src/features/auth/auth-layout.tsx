import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh place-items-center bg-gradient-to-b from-amber-50 via-background to-background px-4 py-10 dark:from-amber-950/20 sm:px-6'>
      <div className='mx-auto flex w-full flex-col items-center justify-center gap-6'>
        <div className='flex items-center justify-center gap-2'>
          <Logo className='size-8' />
          <h1 className='text-2xl font-semibold tracking-tight'>SiCerah</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
