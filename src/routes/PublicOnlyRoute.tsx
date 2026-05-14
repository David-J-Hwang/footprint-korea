import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function PublicOnlyRoute() {
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-600">
        <p className="text-sm font-medium">세션을 확인하는 중입니다.</p>
      </main>
    )
  }

  if (session) {
    return <Navigate replace to="/" />
  }

  return <Outlet />
}

export default PublicOnlyRoute
