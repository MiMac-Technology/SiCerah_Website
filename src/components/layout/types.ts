import { type LinkProps } from '@tanstack/react-router'
import { type Role } from '@/config/roles'

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  /** Roles allowed to see this item. Omit to show it to every role. */
  roles?: Role[]
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
  /** Roles allowed to see this group. Omit to show it to every role. */
  roles?: Role[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
