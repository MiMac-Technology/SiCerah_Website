import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useTransactionsStore } from '@/stores/transactions-store'
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
  const transactions = useTransactionsStore((s) => s.transactions)
  const canTransact = activeRole === 'kasir'

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
              : 'Anda melihat sebagai Ketua — hanya kasir yang dapat mencatat transaksi baru. Riwayat transaksi di bawah bersifat read-only.'}
          </p>
        )}
        <div className='grid gap-6 lg:grid-cols-2'>
          {canTransact && (
            <div className='lg:col-span-2'>
              <PosCartForm />
            </div>
          )}
          <div className='lg:col-span-2'>
            <h3 className='mb-3 text-lg font-semibold'>Riwayat Transaksi</h3>
            <PosTransactionsTable data={transactions} />
          </div>
        </div>
      </Main>
      <PosReceiptSheet />
      <PosVoidDialog />
    </PosProvider>
  )
}
