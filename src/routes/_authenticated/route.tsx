import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getCurrentUser } from '@/features/auth/api'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { user, setUser } = useAuthStore.getState().auth

    if (!user) {
      // Cold load / hard refresh: token httpOnly cookie tidak bisa dibaca JS,
      // jadi satu-satunya cara tahu sesi masih valid adalah nanya ke server.
      try {
        const freshUser = await getCurrentUser()
        setUser(freshUser)
      } catch {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
