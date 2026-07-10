import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Announcement } from '@/stores/announcements-store'

type DialogType = 'create' | 'update' | 'delete'

type PengumumanContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Announcement | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Announcement | null>>
}

const PengumumanContext = React.createContext<PengumumanContextType | null>(
  null
)

export function PengumumanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>()
  const [currentRow, setCurrentRow] = useState<Announcement | null>(null)
  return (
    <PengumumanContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PengumumanContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePengumuman = () => {
  const ctx = React.useContext(PengumumanContext)
  if (!ctx) throw new Error('usePengumuman must be used within PengumumanProvider')
  return ctx
}
