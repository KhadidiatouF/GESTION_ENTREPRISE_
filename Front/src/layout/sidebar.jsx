import { Activity, Building2, FileText, Settings } from 'lucide-react';
import React from 'react';

const SidebarLink = ({ icon, label, isActive, href, onClick }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-green-500 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export default function Sidebar({ activeLink, setActiveLink }) {
  const sidebarLinks = [
    {
      label: "Tableau de Bord",
      icon: <Activity className="w-5 h-5" />,
      linkKey: "dashboard",
    },
    {
      label: "Gestion des Entreprises",
      icon: <Building2 className="w-5 h-5" />,
      linkKey: "manage-companies",
    },
    {
      label: "Rapports & Statistiques",
      icon: <FileText className="w-5 h-5" />,
      linkKey: "reports",
    },
    {
      label: "Paramètres Système",
      icon: <Settings className="w-5 h-5" />,
      linkKey: "settings",
    },
  ];
// const [ setActiveLink] = useState('dashboard'); // État pour le lien actif
  

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen hidden lg:block">
      <nav className="space-y-2 mt-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Navigation
        </p>
        {sidebarLinks.map((link) => (
          <SidebarLink
            key={link.linkKey}
            icon={link.icon}
            label={link.label}
            isActive={activeLink === link.linkKey}
            href={`#${link.linkKey}`}
            onClick={() => setActiveLink(link.linkKey)}
          />
        ))}
      </nav>
    </div>
  );
}
