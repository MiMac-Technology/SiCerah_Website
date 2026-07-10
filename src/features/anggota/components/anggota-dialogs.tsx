import { AnggotaEditDrawer } from './anggota-edit-drawer'
import { useAnggota } from './anggota-provider'
import { AnggotaRegisterDrawer } from './anggota-register-drawer'
import { AnggotaStatusDialog } from './anggota-status-dialog'

export function AnggotaDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAnggota()

  const handleClose = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

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

          <AnggotaStatusDialog
            key={`anggota-status-${currentRow.id}`}
            open={open === 'deactivate'}
            onOpenChange={(v) => {
              if (!v) handleClose()
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
