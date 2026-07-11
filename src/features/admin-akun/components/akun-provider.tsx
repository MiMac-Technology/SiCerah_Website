import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type StaffAccount } from '../api'

type DialogType = 'create' | 'update' | 'status'

type AkunContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: StaffAccount | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StaffAccount | null>>
}

const AkunContext = React.createContext<AkunContextType | null>(null)

export function AkunProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>()
  const [currentRow, setCurrentRow] = useState<StaffAccount | null>(null)
  return (
    <AkunContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AkunContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAkun = () => {
  const ctx = React.useContext(AkunContext)
  if (!ctx) throw new Error('useAkun must be used within AkunProvider')
  return ctx
}
