import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import SuperAdminDashboard from './components/pages/SuperAdminPage';
import UserList from './components/Listes/UserList';
import Caissier from './components/pages/CassierPage';
import AdminEntreprise from './components/pages/AdminPage';
import VigileScanner from './components/pages/VigilePage';
import EmployeQRCode from './components/pages/EmployePage';
import AdminQRCodes from './components/pages/AdminPage';
import EntrepriseList from './components/Listes/EntrepriseList';
import AdminPayrun from './components/pages/AdminPayrun';
import EmployePage from './components/pages/EmployePage';
import HistoriquePointage from './components/pages/Historique';

// Composant de protection de routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default function App({entreprises}) {
  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route path='/' element={<LoginPage />} />
        
        {/* Routes Super Admin */}
        <Route 
          path='/super-admin/dashboard' 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/super-admin/users' 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <UserList />
            </ProtectedRoute>
          } 
        />
         <Route 
          path='/super-admin/entreprises' 
          element={
            <EntrepriseList
              entreprises={entreprises} 
            />
          } 
        />


        {/* Routes Admin */}
        <Route 
          path='/admin/dashboard' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminEntreprise />
            </ProtectedRoute>
          } 
        />
  
        <Route 
          path='/admin/qrcodes' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminQRCodes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/admin/payruns' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPayrun />
            </ProtectedRoute>
          } 
        />

        {/* Routes Caissier */}
        <Route 
          path='/caissier/dashboard' 
          element={
            <ProtectedRoute allowedRoles={['CASSIER']}>
              <Caissier />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/vigile/scanner' 
          element={
            <ProtectedRoute allowedRoles={['VIGILE']}>
              <VigileScanner />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/employe/qrcode' 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYE']}>
              <EmployePage />
            </ProtectedRoute>
          } 
        />

        <Route
          path='/vigile/historique'
          element={
             <ProtectedRoute allowedRoles={['VIGILE']}>
              <HistoriquePointage />
            </ProtectedRoute>

          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}