import React, { useState } from 'react'
import LoginPage from './components/LoginPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import SuperAdminDashboard from './components/SuperAdminPage'
import UserList from './components/UserList'
import Caissier from './components/CassierPage'
import AdminEntreprise from './components/AdminPage'

export default function App() {
  const [activeLink, setActiveLink] = useState('dashboard'); // État pour le lien actif

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/dashboard' element={<SuperAdminDashboard/>}/>
        <Route path='/UserList' element={<UserList  activeLink={activeLink} setActiveLink={setActiveLink}/>}/>
        <Route path='/cassier' element={<Caissier/>}/>
        <Route path='/admin' element={<AdminEntreprise/>}/>

      </Routes>
    </Router>
  )
}
