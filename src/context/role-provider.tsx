import { createContext, useContext, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'
import { DEFAULT_ROLE, type Role } from '@/config/roles'

// NOTE: this is a demo-only "act as" role switcher, decoupled from
// `auth-store`'s `AuthUser.role`. It drives all UI gating in this app;
// there is no real per-role authentication here.
const ROLE_COOKIE_NAME = 'sicerah-role'
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type RoleProviderProps = {
  children: React.ReactNode
}

type RoleProviderState = {
  activeRole: Role
  setActiveRole: (role: Role) => void
}

const initialState: RoleProviderState = {
  activeRole: DEFAULT_ROLE,
  setActiveRole: () => null,
}

const RoleContext = createContext<RoleProviderState>(initialState)

export function RoleProvider({ children }: RoleProviderProps) {
  const [activeRole, _setActiveRole] = useState<Role>(
    () => (getCookie(ROLE_COOKIE_NAME) as Role) || DEFAULT_ROLE
  )

  const setActiveRole = (role: Role) => {
    setCookie(ROLE_COOKIE_NAME, role, ROLE_COOKIE_MAX_AGE)
    _setActiveRole(role)
  }

  return (
    <RoleContext value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => {
  const context = useContext(RoleContext)

  if (!context) throw new Error('useRole must be used within a RoleProvider')

  return context
}
