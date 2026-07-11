import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Mark matahari — melambangkan "Cerah" (transparansi & keterbukaan koperasi).
 * Rays pakai currentColor (ikut tema), inti pakai warna amber tetap biar
 * gampang dikenali di light/dark mode.
 */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='sicerah-logo'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      height='24'
      width='24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('size-6', className)}
      {...props}
    >
      <title>SiCerah</title>
      <circle cx='12' cy='12' r='4.5' fill='#f59e0b' stroke='none' />
      <path d='M12 2.5v2.25M12 19.25v2.25M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.25M19.25 12h2.25M4.4 19.6l1.6-1.6M18 6l1.6-1.6' />
    </svg>
  )
}
