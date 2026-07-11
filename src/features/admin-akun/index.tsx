import { Plus } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRoleAccess } from '@/hooks/use-role-access'
import { handleServerError } from '@/lib/handle-server-error'
import { listAccounts, setAccountStatus } from './api'
import { AkunMutateDrawer } from './components/akun-mutate-drawer'
import { AkunProvider, useAkun } from './components/akun-provider'
import { AkunTable } from './components/akun-table'

function AkunDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAkun()
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'aktif' | 'nonaktif' }) =>
      setAccountStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-akun'] })
      toast.success('Status akun diperbarui')
    },
    onError: handleServerError,
  })

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      <AkunMutateDrawer
        key='akun-create'
        open={open === 'create'}
        onOpenChange={(v) => !v && close()}
      />
      {currentRow && (
        <>
          <AkunMutateDrawer
            key={`akun-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => !v && close()}
            currentRow={currentRow}
          />
          <ConfirmDialog
            open={open === 'status'}
            onOpenChange={(v) => !v && close()}
            title={
              currentRow.status === 'aktif'
                ? 'Nonaktifkan akun?'
                : 'Aktifkan akun?'
            }
            desc={`Akun ${currentRow.name} akan ${currentRow.status === 'aktif' ? 'dinonaktifkan dan tidak bisa login' : 'diaktifkan kembali'}.`}
            destructive={currentRow.status === 'aktif'}
            confirmText={
              currentRow.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'
            }
            cancelBtnText='Batal'
            handleConfirm={() => {
              statusMutation.mutate({
                id: currentRow.id,
                status: currentRow.status === 'aktif' ? 'nonaktif' : 'aktif',
              })
              close()
            }}
          />
        </>
      )}
    </>
  )
}

function AdminAkunContent() {
  const { activeRole, hasAccess } = useRoleAccess(['admin'])
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['admin-akun'],
    queryFn: listAccounts,
  })
  const { setOpen } = useAkun()

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
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Manajemen Akun Pengurus
            </h2>
            <p className='text-muted-foreground'>
              Kelola akun dan hak akses (RBAC) untuk setiap role pengurus.
            </p>
          </div>
          <Button disabled={!hasAccess} onClick={() => setOpen('create')}>
            <Plus className='size-4' /> Buat Akun
          </Button>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          {isLoading ? (
            <p className='text-muted-foreground px-4 py-8 text-center'>
              Memuat data...
            </p>
          ) : (
            <AkunTable data={accounts} />
          )}
        </div>
      </Main>
      <AkunDialogs />
    </>
  )
}

export function AdminAkun() {
  return (
    <AkunProvider>
      <AdminAkunContent />
    </AkunProvider>
  )
}
