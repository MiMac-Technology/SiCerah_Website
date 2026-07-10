import { useRole } from '@/context/role-provider'
import { type Role } from '@/config/roles'

export function useRoleAccess(allowed: Role[]) {
  const { activeRole } = useRole()
  return { activeRole, hasAccess: allowed.includes(activeRole) }
}
