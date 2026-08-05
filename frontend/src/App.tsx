import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainLayout from './pages/MainLayout'
import ChatPage from './pages/ChatPage'
import ChatRoom from './pages/ChatRoom'
import FriendsPage from './pages/FriendsPage'
import MomentsPage from './pages/MomentsPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-love-pink"></div>
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/chat" />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:friendId" element={<ChatRoom />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="moments" element={<MomentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
