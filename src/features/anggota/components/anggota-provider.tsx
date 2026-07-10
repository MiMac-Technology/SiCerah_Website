import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Member } from '@/stores/members-store'

type DialogType = 'register' | 'update' | 'deactivate'

type AnggotaContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Member | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Member | null>>
}

const AnggotaContext = React.createContext<AnggotaContextType | null>(null)

export function AnggotaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>()
  const [currentRow, setCurrentRow] = useState<Member | null>(null)
  return (
    <AnggotaContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AnggotaContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAnggota = () => {
  const ctx = React.useContext(AnggotaContext)
  if (!ctx) throw new Error('useAnggota must be used within AnggotaProvider')
  return ctx
}
