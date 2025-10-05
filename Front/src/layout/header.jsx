import { Bell, ChevronDown, Crown, HatGlasses, LogOut, Shield, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ notifications }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    prenom: '',
    nom: '',
    role: ''
  });

  useEffect(() => {
    const prenom = localStorage.getItem("userPrenom") || '';
    const nom = localStorage.getItem("userName") || '';
    const role = localStorage.getItem("userRole") || 'user';
    
    setUserData({ prenom, nom, role });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId"); 
    localStorage.removeItem("userName"); 
    localStorage.removeItem("userPrenom");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const getInitials = () => {
    const prenomInitial = userData.prenom?.charAt(0)?.toUpperCase() || '';
    const nomInitial = userData.nom?.charAt(0)?.toUpperCase() || '';
    return prenomInitial + nomInitial || 'U';
  };

  const getFullName = () => {
    if (userData.prenom && userData.nom) {
      return `${userData.prenom} ${userData.nom}`;
    }
    return 'Utilisateur';
  };

  const getRoleLabel = () => {
    switch(userData.role?.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'ADMIN';
      case 'CASSIER':
        return 'CASSIER';
      case 'VIGILE':
        return 'VIGILE';
      default:
        return 'EMPLOYÉ';
    }
  };

  const getRoleIcon = () => {
    switch(userData.role?.toLowerCase()) {
      case 'SUPER_ADMIN':
        return <Crown className="w-5 h-5 text-white" />;
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-white" />;
      case 'VIGILE':
        return <HatGlasses className="w-5 h-5 text-white" />;
      default:
        return <User className="w-5 h-5 text-white" />;
    }
  };

  const getRoleColor = () => {
    switch(userData.role?.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'from-green-600 to-green-600';
      case 'ADMIN':
        return 'from-blue-600 to-blue-600';
      case 'CASSIER':
        return 'from-purple-600 to-purple-600';
      case 'VIGLE':
        return 'from-yellow-600 to-yellow-600';
      default:
        return 'from-gray-600 to-gray-600';
    }
  };

  const getAvatarColor = () => {
    switch(userData.role?.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'bg-green-600';
      case 'ADMIN':
        return 'bg-blue-600';
      case 'CASSIER':
        return 'bg-purple-600';
      case 'VIGILE':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-lg flex items-center justify-center`}>
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestion des entreprises</h1>
              <p className="text-sm text-gray-500">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className={`w-8 h-8 ${getAvatarColor()} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-medium">{getInitials()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{getFullName()}</span>
              <span className="text-xs text-gray-500">{getRoleLabel()}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          <button 
            onClick={handleLogout} 
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}