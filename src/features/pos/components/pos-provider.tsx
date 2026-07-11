import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Sale } from '../api'

type DialogType = 'struk' | 'void'

type PosContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentTransaction: Sale | null
  setCurrentTransaction: React.Dispatch<React.SetStateAction<Sale | null>>
}

const PosContext = React.createContext<PosContextType | null>(null)

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>()
  const [currentTransaction, setCurrentTransaction] = useState<Sale | null>(
    null
  )

  return (
    <PosContext
      value={{ open, setOpen, currentTransaction, setCurrentTransaction }}
    >
      {children}
    </PosContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePos = () => {
  const ctx = React.useContext(PosContext)
  if (!ctx) throw new Error('usePos must be used within PosProvider')
  return ctx
}
