import React, { useState } from 'react'

type ApprovalContextType = {
  selectedId: string | null
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
}

const ApprovalContext = React.createContext<ApprovalContextType | null>(null)

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return (
    <ApprovalContext value={{ selectedId, setSelectedId }}>
      {children}
    </ApprovalContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApprovalUi = () => {
  const ctx = React.useContext(ApprovalContext)
  if (!ctx) throw new Error('useApprovalUi must be used within ApprovalProvider')
  return ctx
}
