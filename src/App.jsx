import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import HomePgae from './pages/HomePgae'
import { useAuthStore } from './Store/useAuthStore'
import { Loader } from "lucide-react";
import { Toaster } from 'react-hot-toast'
import { jwtDecode } from "jwt-decode";
import { useThemeStore } from './Store/useThemeStore'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const {theme}=useThemeStore();

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Navbar />

      <Routes>
        <Route path='/' element={authUser  ? <HomePgae /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* <Routes>
        <Route path='/' element={token ? <HomePgae /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!token ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!token ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={token ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes> */}
    </div>
  )
}

export default App
