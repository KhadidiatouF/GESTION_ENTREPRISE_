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

// Configuration des liens de navigation par rôle
export const sidebarConfig = {
  SUPER_ADMIN: [
    {
      label: "Tableau de Bord",
      icon: Activity,
      linkKey: "dashboard",
      path: "/super-admin/dashboard"
    },
    {
      label: "Gestion des Entreprises",
      icon: Building2,
      linkKey: "entreprises",
      path: "/super-admin/entreprises"
    },
    {
      label: "Utilisateurs",
      icon: Users,
      linkKey: "users",
      path: "/super-admin/users"
    },
    {
      label: "Rapports & Statistiques",
      icon: FileText,
      linkKey: "reports",
      path: "/super-admin/reports"
    },
    {
      label: "Paramètres Système",
      icon: Settings,
      linkKey: "settings",
      path: "/super-admin/settings"
    }
  ],

  ADMIN: [
    {
      label: "Tableau de Bord",
      icon: Activity,
      linkKey: "dashboard",
      path: "/admin/dashboard"
    },
    {
      label: "Employés",
      icon: Users,
      linkKey: "employes",
      path: "/admin/employes"
    },
    {
      label: "Cycles de Paie",
      icon: Calendar,
      linkKey: "payruns",
      path: "/admin/payruns"
    },
    {
      label: "Pointages",
      icon: Clock,
      linkKey: "pointages",
      path: "/admin/pointages"
    },
    {
      label: "QR Codes",
      icon: QrCode,
      linkKey: "qrcodes",
      path: "/admin/qrcodes"
    },
    {
      label: "Statistiques",
      icon: BarChart3,
      linkKey: "statistiques",
      path: "/admin/statistiques"
    },
    {
      label: "Paramètres",
      icon: Settings,
      linkKey: "settings",
      path: "/admin/settings"
    }
  ],

  CASSIER: [
    {
      label: "Tableau de Bord",
      icon: Activity,
      linkKey: "dashboard",
      path: "/caissier/dashboard"
    },
    {
      label: "Paiements",
      icon: DollarSign,
      linkKey: "paiements",
      path: "/caissier/paiements"
    },
    {
      label: "Historique",
      icon: FileText,
      linkKey: "historique",
      path: "/caissier/historique"
    },
    {
      label: "Rapports",
      icon: BarChart3,
      linkKey: "rapports",
      path: "/caissier/rapports"
    }
  ],

  VIGILE: [
    {
      label: "Scanner QR Code",
      icon: QrCode,
      linkKey: "scanner",
      path: "/vigile/scanner"
    },
    {
      label: "Historique du jour",
      icon: Clock,
      linkKey: "historique",
      path: "/vigile/historique"
    },
    {
      label: "Pointages récents",
      icon: UserCheck,
      linkKey: "pointages",
      path: "/vigile/pointages"
    }
  ],

  EMPLOYE: [
    {
      label: "Mon Tableau de Bord",
      icon: Activity,
      linkKey: "dashboard",
      path: "/employe/dashboard"
    },
    {
      label: "Mes Pointages",
      icon: Clock,
      linkKey: "pointages",
      path: "/employe/pointages"
    },
    {
      label: "Mon QR Code",
      icon: QrCode,
      linkKey: "qrcode",
      path: "/employe/qrcode"
    },
    {
      label: "Mes Bulletins",
      icon: FileText,
      linkKey: "bulletins",
      path: "/employe/bulletins"
    },
    {
      label: "Mon Profil",
      icon: Settings,
      linkKey: "profil",
      path: "/employe/profil"
    }
  ]
};

// Fonction pour obtenir les liens selon le rôle
export const getSidebarLinks = (role) => {
  return sidebarConfig[role] || [];
};

// Fonction pour vérifier si un utilisateur a accès à une route
export const hasAccess = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};