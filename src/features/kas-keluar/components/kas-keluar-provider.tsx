import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Expense } from '@/stores/expenses-store'

type DialogType = 'create' | 'verify' | 'correct'

type KasKeluarContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Expense | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Expense | null>>
}

const KasKeluarContext = React.createContext<KasKeluarContextType | null>(
  null
)

export function KasKeluarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>()
  const [currentRow, setCurrentRow] = useState<Expense | null>(null)
  return (
    <KasKeluarContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </KasKeluarContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKasKeluar = () => {
  const ctx = React.useContext(KasKeluarContext)
  if (!ctx) throw new Error('useKasKeluar must be used within KasKeluarProvider')
  return ctx
}
