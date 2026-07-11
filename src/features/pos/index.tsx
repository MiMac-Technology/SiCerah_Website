import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { handleServerError } from '@/lib/handle-server-error'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  approveVoidSale,
  listPendingVoidSales,
  listSales,
  rejectVoidSale,
} from './api'
import { PosCartForm } from './components/pos-cart-form'
import { PosProvider } from './components/pos-provider'
import { PosReceiptSheet } from './components/pos-receipt-sheet'
import { PosTransactionsTable } from './components/pos-transactions-table'
import { PosVoidDialog } from './components/pos-void-dialog'

export function Pos() {
  const { activeRole, hasAccess } = useRoleAccess([
    'kasir',
    'ketua',
    'bendahara',
  ])
  const canTransact = activeRole === 'kasir'
  const queryClient = useQueryClient()

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['pos', 'penjualan', activeRole],
    queryFn: () =>
      activeRole === 'kasir' ? listSales() : listPendingVoidSales(),
    enabled: hasAccess && (activeRole === 'kasir' || activeRole === 'bendahara'),
  })

  const approveMutation = useMutation({
    mutationFn: approveVoidSale,
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'penjualan'] })
      toast.success(`Void ${sale.trxNo} disetujui`)
    },
    onError: handleServerError,
  })

  const rejectMutation = useMutation({
    mutationFn: rejectVoidSale,
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'penjualan'] })
      toast.info(`Void ${sale.trxNo} ditolak`)
    },
    onError: handleServerError,
  })

  return (
    <PosProvider>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>POS</h2>
          <p className='text-muted-foreground'>
            Identifikasi pembeli, catat transaksi, dan kirim struk pembanding
            harga.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        {hasAccess && !canTransact && (
          <p className='mb-4 text-sm text-muted-foreground'>
            {activeRole === 'bendahara'
              ? 'Anda melihat sebagai Bendahara — gunakan menu aksi pada baris transaksi untuk menyetujui/menolak pengajuan void dari kasir.'
              : 'Anda melihat sebagai Ketua — riwayat transaksi lintas kasir belum tersedia untuk role ini.'}
          </p>
        )}
        <div className='grid gap-6 lg:grid-cols-2'>
          {canTransact && (
            <div className='lg:col-span-2'>
              <PosCartForm />
            </div>
          )}
          <div className='lg:col-span-2'>
            <h3 className='mb-3 text-lg font-semibold'>
              {activeRole === 'bendahara'
                ? 'Antrean Persetujuan Void'
                : 'Riwayat Transaksi'}
            </h3>
            {isLoading ? (
              <p className='py-8 text-center text-muted-foreground'>
                Memuat data...
              </p>
            ) : (
              <PosTransactionsTable
                data={transactions}
                onApproveVoid={(sale) => approveMutation.mutate(sale.id)}
                onRejectVoid={(sale) => rejectMutation.mutate(sale.id)}
              />
            )}
          </div>
        </div>
      </Main>
      <PosReceiptSheet />
      <PosVoidDialog />
    </PosProvider>
  )
}
