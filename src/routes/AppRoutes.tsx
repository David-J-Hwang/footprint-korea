import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default AppRoutes
