import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Building2, 
  FileText, 
  Settings, 
  Users,
  DollarSign,
  Calendar,
  QrCode,
  BarChart3,
  Clock,
  UserCheck
} from 'lucide-react';

const sidebarConfig = {
  SUPER_ADMIN: [
    { label: "Tableau de Bord", icon: Activity, path: "/super-admin/dashboard" },
    { label: "Utilisateurs", icon: Users, path: "/super-admin/users" },
    { label: "Entreprises", icon: Building2, path: "/super-admin/entreprises" }
  ],
  ADMIN: [
    { label: "Tableau de Bord", icon: Activity, path: "/admin/dashboard" },
    { label: "Cycles de Paie", icon: Calendar, path: "/admin/payruns" },
    { label: "Pointages", icon: Clock, path: "/admin/pointages" },
    { label: "QR Codes", icon: QrCode, path: "/admin/qrcodes" },
    { label: "Statistiques", icon: BarChart3, path: "/admin/statistiques" }
  ],
  CASSIER: [
    { label: "Tableau de Bord", icon: Activity, path: "/caissier/dashboard" },
    { label: "Historique", icon: FileText, path: "/caissier/historique" }
  ],
  VIGILE: [
    { label: "Scanner QR Code", icon: QrCode, path: "/vigile/scanner" },
    { label: "Historique", icon: Clock, path: "/vigile/historique" }
  ],
  EMPLOYE: [
    { label: "Mon QR Code", icon: QrCode, path: "/employe/qrcode" },
    { label: "Mes Pointages", icon: Clock, path: "/employe/pointages" },
    { label: "Mes Bulletins", icon: FileText, path: "/employe/bulletins" }
  ]
};

const SidebarLink = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-green-500 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'EMPLOYE';
  const userName = localStorage.getItem('userName') || 'Utilisateur';
  
  const sidebarLinks = sidebarConfig[userRole] || [];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen hidden lg:block flex flex-col">
      <nav className="space-y-2 mt-2 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Navigation
        </p>
        {sidebarLinks.length > 0 ? (
          sidebarLinks.map((link, index) => (
            <SidebarLink
              key={index}
              icon={link.icon}
              label={link.label}
              isActive={isLinkActive(link.path)}
              onClick={() => handleNavigation(link.path)}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            Aucun menu disponible
          </div>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Connecté en tant que</p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {userName}
          </p>
          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {userRole}
          </span>
        </div>
      </div>
    </div>
  );
}