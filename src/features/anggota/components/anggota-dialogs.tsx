import { useRole } from '@/context/role-provider'
import { useMembersStore } from '@/stores/members-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AnggotaEditDrawer } from './anggota-edit-drawer'
import { useAnggota } from './anggota-provider'
import { AnggotaRegisterDrawer } from './anggota-register-drawer'

export function AnggotaDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAnggota()
  const { activeRole } = useRole()
  const setMemberStatus = useMembersStore((s) => s.setMemberStatus)

  const handleClose = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  const isActive = currentRow?.status === 'aktif'

  return (
    <>
      <AnggotaRegisterDrawer
        open={open === 'register'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <AnggotaEditDrawer
            key={`anggota-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) handleClose()
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key={`anggota-deactivate-${currentRow.id}`}
            open={open === 'deactivate'}
            onOpenChange={(v) => {
              if (!v) handleClose()
            }}
            title={isActive ? 'Nonaktifkan anggota?' : 'Aktifkan kembali anggota?'}
            desc={
              isActive ? (
                <>
                  Anggota <strong>{currentRow.fullName}</strong> (
                  {currentRow.memberNo}) akan dinonaktifkan. Anggota tidak akan
                  dapat melakukan transaksi selama berstatus nonaktif.
                </>
              ) : (
                <>
                  Anggota <strong>{currentRow.fullName}</strong> (
                  {currentRow.memberNo}) akan diaktifkan kembali.
                </>
              )
            }
            destructive={isActive}
            confirmText={isActive ? 'Nonaktifkan' : 'Aktifkan'}
            cancelBtnText='Batal'
            handleConfirm={() => {
              setMemberStatus(
                currentRow.id,
                isActive ? 'nonaktif' : 'aktif',
                activeRole
              )
              handleClose()
            }}
          />
        </>
      )}
    </>
  )
}
