import { Navigate, Route, Routes } from 'react-router-dom'
import EditVisitPage from '../pages/EditVisitPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NewVisitPage from '../pages/NewVisitPage'
import VisitDetailPage from '../pages/VisitDetailPage'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<NewVisitPage />} path="/visits/new" />
        <Route element={<EditVisitPage />} path="/visits/:visitId/edit" />
        <Route element={<VisitDetailPage />} path="/visits/:visitId" />
      </Route>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<LoginPage />} path="/login" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default AppRoutes
