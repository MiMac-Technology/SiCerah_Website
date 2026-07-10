import { useRole } from '@/context/role-provider'
import { useAnnouncementsStore } from '@/stores/announcements-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePengumuman } from './pengumuman-provider'
import { PengumumanMutateDrawer } from './pengumuman-mutate-drawer'

export function PengumumanDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePengumuman()
  const { activeRole } = useRole()
  const deleteAnnouncement = useAnnouncementsStore((s) => s.deleteAnnouncement)

  return (
    <>
      <PengumumanMutateDrawer
        key='pengumuman-create'
        open={open === 'create'}
        onOpenChange={(v) => setOpen(v ? 'create' : null)}
      />

      {currentRow && (
        <>
          <PengumumanMutateDrawer
            key={`pengumuman-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              setOpen(v ? 'update' : null)
              if (!v) {
                setTimeout(() => setCurrentRow(null), 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='pengumuman-delete'
            open={open === 'delete'}
            onOpenChange={(v) => {
              setOpen(v ? 'delete' : null)
              if (!v) {
                setTimeout(() => setCurrentRow(null), 500)
              }
            }}
            handleConfirm={() => {
              deleteAnnouncement(currentRow.id, activeRole)
              setOpen(null)
              setTimeout(() => setCurrentRow(null), 500)
            }}
            title='Hapus Pengumuman?'
            desc={
              <>
                Anda akan menghapus pengumuman{' '}
                <strong>{currentRow.title}</strong>. Tindakan ini tidak dapat
                dibatalkan.
              </>
            }
            confirmText='Hapus'
            cancelBtnText='Batal'
            destructive
          />
        </>
      )}
    </>
  )
}
