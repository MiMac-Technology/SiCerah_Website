import { BadgeCheck, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  useRedemptionsStore,
  type RedemptionStatus,
} from '@/stores/redemptions-store'

const STATUS_VARIANT: Record<
  RedemptionStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  'Menunggu Approval': 'secondary',
  Disetujui: 'outline',
  Dieksekusi: 'default',
  Ditolak: 'destructive',
}

export function PenukaranPoin() {
  const { activeRole, hasAccess } = useRoleAccess([
    'kasir',
    'bendahara',
    'ketua',
  ])
  const { activeRole: role } = useRole()
  const redemptions = useRedemptionsStore((s) => s.redemptions)
  const approveRedemption = useRedemptionsStore((s) => s.approveRedemption)
  const rejectRedemption = useRedemptionsStore((s) => s.rejectRedemption)
  const executeRedemption = useRedemptionsStore((s) => s.executeRedemption)

  const isKasir = role === 'kasir'
  const isBendahara = role === 'bendahara'

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Konfirmasi Penukaran KopPoin
          </h2>
          <p className='text-muted-foreground'>
            Request tukar poin dari aplikasi anggota: Bendahara meng-approve,
            lalu Kasir mengeksekusi penukaran di loket.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <Card>
          <CardHeader>
            <CardTitle>Request Penukaran</CardTitle>
            <CardDescription>
              {isKasir
                ? 'Tombol "Konfirmasi Penukaran" aktif hanya untuk request yang sudah di-approve Bendahara. Poin otomatis terpotong dari saldo anggota.'
                : isBendahara
                  ? 'Approve atau tolak request yang masuk; eksekusi dilakukan Kasir di loket.'
                  : 'Anda melihat daftar request secara read-only.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Diminta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-end'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.length ? (
                    redemptions.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span>{r.memberName}</span>
                            <span className='text-xs text-muted-foreground'>
                              {r.memberNo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{r.rewardName}</TableCell>
                        <TableCell>
                          {r.pointCost.toLocaleString('id-ID')} poin
                        </TableCell>
                        <TableCell>{formatDateTime(r.requestedAt)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[r.status]}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-end'>
                          <div className='flex justify-end gap-2'>
                            {isBendahara && r.status === 'Menunggu Approval' && (
                              <>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => {
                                    approveRedemption(r.id, role)
                                    toast.success(
                                      `Request ${r.memberName} di-approve — menunggu eksekusi Kasir`
                                    )
                                  }}
                                >
                                  <Check className='size-4' /> Approve
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => {
                                    rejectRedemption(r.id, role)
                                    toast.info('Request ditolak')
                                  }}
                                >
                                  <X className='size-4' /> Tolak
                                </Button>
                              </>
                            )}
                            {isKasir && r.status === 'Disetujui' && (
                              <Button
                                size='sm'
                                onClick={() => {
                                  executeRedemption(r.id, role)
                                  toast.success(
                                    `Penukaran dieksekusi — ${r.pointCost.toLocaleString('id-ID')} poin terpotong dari saldo ${r.memberName}`
                                  )
                                }}
                              >
                                <BadgeCheck className='size-4' /> Konfirmasi
                                Penukaran
                              </Button>
                            )}
                            {isKasir && r.status === 'Menunggu Approval' && (
                              <span className='text-xs text-muted-foreground'>
                                Menunggu approval Bendahara
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center'>
                        Belum ada request penukaran.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
