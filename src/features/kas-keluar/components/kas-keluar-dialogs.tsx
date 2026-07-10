import { useRole } from '@/context/role-provider'
import { useExpensesStore } from '@/stores/expenses-store'
import { formatCurrency } from '@/lib/format'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useKasKeluar } from './kas-keluar-provider'
import { KasKeluarCorrectionDialog } from './kas-keluar-correction-dialog'
import { KasKeluarMutateDrawer } from './kas-keluar-mutate-drawer'

export function KasKeluarDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useKasKeluar()
  const { activeRole } = useRole()
  const verifyExpense = useExpensesStore((s) => s.verifyExpense)

  return (
    <>
      <KasKeluarMutateDrawer
        key='kas-keluar-create'
        open={open === 'create'}
        onOpenChange={(v) => setOpen(v ? 'create' : null)}
      />

      {currentRow && (
        <KasKeluarCorrectionDialog
          key={`kas-keluar-correct-${currentRow.id}`}
          open={open === 'correct'}
          onOpenChange={(v) => {
            setOpen(v ? 'correct' : null)
            if (!v) {
              setTimeout(() => setCurrentRow(null), 500)
            }
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <ConfirmDialog
          key='kas-keluar-verify'
          open={open === 'verify'}
          onOpenChange={(v) => {
            setOpen(v ? 'verify' : null)
            if (!v) {
              setTimeout(() => setCurrentRow(null), 500)
            }
          }}
          handleConfirm={() => {
            verifyExpense(currentRow.id, activeRole)
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 500)
          }}
          title='Verifikasi pengeluaran?'
          desc={
            <>
              Anda akan memverifikasi pengeluaran{' '}
              <strong>{currentRow.expenseNo}</strong> senilai{' '}
              <strong>{formatCurrency(currentRow.amount)}</strong>
              .
            </>
          }
          confirmText='Verifikasi'
          cancelBtnText='Batal'
        />
      )}
    </>
  )
}
