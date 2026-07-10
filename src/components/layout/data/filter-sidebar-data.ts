import { type Role } from '@/config/roles'
import { type NavGroup, type SidebarData } from '../types'

function isVisible(roles: Role[] | undefined, activeRole: Role): boolean {
  return !roles || roles.includes(activeRole)
}

export function getFilteredSidebarData(
  data: SidebarData,
  activeRole: Role
): SidebarData {
  const navGroups: NavGroup[] = data.navGroups
    .filter((group) => isVisible(group.roles, activeRole))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => isVisible(item.roles, activeRole))
        .map((item) =>
          item.items
            ? {
                ...item,
                items: item.items.filter((subItem) =>
                  isVisible(subItem.roles, activeRole)
                ),
              }
            : item
        ),
    }))
    .filter((group) => group.items.length > 0)

  return { ...data, navGroups }
}
