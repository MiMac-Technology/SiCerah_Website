import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'
import { useAuthStore } from '@/stores/auth-store'
import { DEFAULT_ROLE, ROLES, type Role } from '@/config/roles'

// "Act as" role switcher — dipakai buat preview UI role lain (masih tahap
// dummy/demo untuk role selain milik sendiri). Begitu ada login/rehydrate
// sesi baru, activeRole di-sync SEKALI ke role asli user dari auth-store;
// setelah itu switcher tetap bebas dipakai ganti-ganti role buat demo.
const ROLE_COOKIE_NAME = 'sicerah-role'
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function isKnownRole(role: string): role is Role {
  return (ROLES as string[]).includes(role)
}

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
  const authUser = useAuthStore((s) => s.auth.user)
  const syncedUserId = useRef<number | null>(null)

  const setActiveRole = (role: Role) => {
    setCookie(ROLE_COOKIE_NAME, role, ROLE_COOKIE_MAX_AGE)
    _setActiveRole(role)
  }

  useEffect(() => {
    if (!authUser) {
      syncedUserId.current = null
      return
    }

    if (syncedUserId.current === authUser.id) return
    syncedUserId.current = authUser.id

    // Anggota (mobile-only) tidak punya halaman di dashboard web ini —
    // biarkan default kalau ada yang login pakai akun anggota.
    if (isKnownRole(authUser.role)) {
      // Sinkronisasi dari auth-store (event login/rehydrate sesi) ke context
      // switcher — bukan derived state biasa, sengaja cuma sekali per user.id.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveRole(authUser.role)
    }
  }, [authUser])

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
