import { useState } from 'react';
import { 
  Building2, Users, DollarSign, TrendingUp, Bell, Settings, LogOut, Activity, ChevronDown, FileText, Crown 
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import EntrepriseList from './EntrepriseList';
import UserList from './UserList';
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';



const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

// const SidebarLink = ({ icon, label, isActive, href, onClick }) => (
//   <a
//     href={href}
//     onClick={(e) => {
//       e.preventDefault();
//       onClick();
//     }}
//     className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//       isActive
//         ? 'bg-blue-500 text-white shadow-md'
//         : 'text-gray-600 hover:bg-gray-100'
//     }`}
//   >
//     {icon}
//     <span className="text-sm font-medium">{label}</span>
//   </a>
// );

// const Sidebar = ({ activeLink, setActiveLink }) => {
//   const sidebarLinks = [
//     {
//       label: "Tableau de Bord",
//       icon: <Activity className="w-5 h-5" />,
//       linkKey: "dashboard",
//     },
//     {
//       label: "Gestion des Entreprises",
//       icon: <Building2 className="w-5 h-5" />,
//       linkKey: "manage-companies",
//     },
    
//     {
//       label: "Rapports & Statistiques",
//       icon: <FileText className="w-5 h-5" />,
//       linkKey: "reports",
//     },
//     {
//       label: "Paramètres Système",
//       icon: <Settings className="w-5 h-5" />,
//       linkKey: "settings",
//     },
//   ];

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen hidden lg:block">
//       <nav className="space-y-2 mt-2">
//         <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Navigation</p>
//         {sidebarLinks.map((link) => (
//           <SidebarLink
//             key={link.linkKey}
//             icon={link.icon}
//             label={link.label}
//             isActive={activeLink === link.linkKey}
//             href={`#${link.linkKey}`}
//             onClick={() => setActiveLink(link.linkKey)}
//           />
//         ))}
//       </nav>
//     </div>
//   );
// };

//  const Header = ({ notifications }) => {

//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("userId"); 
//     localStorage.removeItem("userName"); 
//     localStorage.removeItem("userPrenom"); 
//     navigate("/");
//   };
 
//   return (
//   <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center space-x-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-lg flex items-center justify-center">
//             <Crown className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">PayrollPro</h1>
//             <p className="text-sm text-gray-500">Super Administrateur</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center space-x-4">
//         <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
//           <Bell className="w-5 h-5" />
//           {notifications > 0 && (
//             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//               {notifications}
//             </span>
//           )}
//         </button>
        
//         <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
//           <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">SA</span>
//           </div>
//           <span className="text-sm font-medium text-gray-700">Super Admin</span>
//           <ChevronDown className="w-4 h-4 text-gray-400" />
//         </div>

//         <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
//           <LogOut className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   </header>

//   );
// };
// Composant pour les cartes de statistiques (Réutilisable)
const StatCard = ({ title, value, icon: Icon, iconBgColor, evolutionText, evolutionType, evolutionValue }) => {
  
  const EvolutionIcon = evolutionType === 'good' ? TrendingUp : TrendingUp; // Utilisez TrendingUp pour les deux, la couleur donne le contexte
  const evolutionColor = evolutionType === 'good' ? 'text-green-600' : evolutionType === 'bad' ? 'text-red-600' : 'text-gray-600';
  const evolutionIconColor = evolutionType === 'good' ? 'text-green-500' : evolutionType === 'bad' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${evolutionIconColor.replace('500', '600')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {evolutionValue && (
          <EvolutionIcon className={`w-4 h-4 ${evolutionIconColor} mr-1`} />
        )}
        <span className={evolutionColor}>{evolutionText}</span>
      </div>
    </div>
  );
};


const DefaultDashboardContent = ({ globalStats, evolutionEntreprises, repartitionSectorielle, evolutionMasseSalariale }) => {

  const pieColors = repartitionSectorielle.map(d => d.couleur);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Entreprises totales"
          value={globalStats.totalEntreprises}
          icon={Building2}
          iconBgColor="bg-blue-100"
          evolutionText="+3 ce mois"
          evolutionType="good"
        />
        <StatCard
          title="Employés totaux"
          value={globalStats.totalEmployes.toLocaleString()}
          icon={Users}
          iconBgColor="bg-orange-100"
          evolutionText="+127 ce mois"
          evolutionType="good"
        />
        <StatCard
          title="Masse salariale totale"
          value={formatCurrency(globalStats.masseSalarialeTotale)}
          icon={DollarSign}
          iconBgColor="bg-purple-100"
          evolutionText={`${globalStats.evolutionMois > 0 ? '+' : ''}${globalStats.evolutionMois}% ce mois`}
          evolutionType={globalStats.evolutionMois >= 0 ? 'good' : 'bad'}
          evolutionValue={globalStats.evolutionMois}
        />
        <StatCard
          title="Taux d'activité"
          value="94.2%"
          icon={Activity}
          iconBgColor="bg-red-100"
          evolutionText="Très bon"
          evolutionType="good"
        />
      </div>

      {/* Graphiques analytiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Croissance des Entreprises (Area Chart) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Entreprises</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={evolutionEntreprises}>
              <defs>
                <linearGradient id="colorEntreprises" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} labelStyle={{color: '#374151'}} />
              <Area type="monotone" dataKey="entreprises" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEntreprises)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Croissance des Employés (Line Chart) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Employés</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolutionEntreprises}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} labelStyle={{color: '#374151'}} />
              <Line type="monotone" dataKey="employes" stroke="#10B981" strokeWidth={3} dot={{r: 5, fill: '#10B981'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition sectorielle (Pie Chart) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Secteur</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={repartitionSectorielle}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="nombre"
              >
                {repartitionSectorielle.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {repartitionSectorielle.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: item.couleur}}></div>
                <span className="text-gray-600">{item.secteur} ({item.nombre})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Évolution masse salariale (Area Chart) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Masse Salariale Mensuelle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={evolutionMasseSalariale}>
              <defs>
                <linearGradient id="colorMasse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="semaine" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#6B7280'}}
                tickFormatter={(value) => `${(value/1000)}k`}
              />
              <Tooltip 
                contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}}
                labelStyle={{color: '#374151'}}
                formatter={(value) => [`${formatCurrency(value)}`, 'Montant']}
              />
              <Area 
                type="monotone" 
                dataKey="montant" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#colorMasse)" 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques de paiements (Bar Chart) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements par Semaine</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evolutionMasseSalariale}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="semaine" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}}
                labelStyle={{color: '#374151'}}
                formatter={(value) => [value, 'Paiements']}
              />
              <Bar dataKey="paiements" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


export default function App() {
 

  const [notifications] = useState(3);
  const [activeLink, setActiveLink] = useState('dashboard'); // État pour le lien actif

  // Données simulées pour le Dashboard et Entreprises
  const globalStats = {
    totalEntreprises: 45,
    totalEmployes: 2847,
    masseSalarialeTotale: 1250000,
    evolutionMois: 8.5
  };

  const evolutionEntreprises = [
    { mois: 'Juil', entreprises: 32, employes: 1850, masseSalariale: 850000 },
    { mois: 'Août', entreprises: 35, employes: 2120, masseSalariale: 980000 },
    { mois: 'Sept', entreprises: 38, employes: 2350, masseSalariale: 1100000 },
    { mois: 'Oct', entreprises: 41, employes: 2580, masseSalariale: 1180000 },
    { mois: 'Nov', entreprises: 43, employes: 2720, masseSalariale: 1220000 },
    { mois: 'Déc', entreprises: 45, employes: 2847, masseSalariale: 1250000 },
  ];

  const repartitionSectorielle = [
    { secteur: 'Services', nombre: 18, couleur: '#3B82F6' },
    { secteur: 'Commerce', nombre: 12, couleur: '#10B981' },
    { secteur: 'Industrie', nombre: 8, couleur: '#8B5CF6' },
    { secteur: 'Agriculture', nombre: 4, couleur: '#F59E0B' },
    { secteur: 'Autres', nombre: 3, couleur: '#EF4444' },
  ];

  const evolutionMasseSalariale = [
    { semaine: 'S1', montant: 280000, paiements: 156 },
    { semaine: 'S2', montant: 320000, paiements: 189 },
    { semaine: 'S3', montant: 290000, paiements: 167 },
    { semaine: 'S4', montant: 360000, paiements: 203 },
  ];

  const entreprises = [
    {
      id: 1, nom: "TechCorp SARL", logo: "TC", employes: 145, masseSalariale: 425000, dernierePaie: "2024-01-15", statut: "actif", evolution: 12.3, admin: "Marie Diop"
    },
    {
      id: 2, nom: "CommerceMax SA", logo: "CM", employes: 89, masseSalariale: 178000, dernierePaie: "2024-01-10", statut: "actif", evolution: -2.1, admin: "Amadou Fall"
    },
    {
      id: 3, nom: "Industries Nord", logo: "IN", employes: 234, masseSalariale: 567000, dernierePaie: "2024-01-12", statut: "suspendu", evolution: 5.8, admin: "Fatou Seck"
    },
    {
      id: 4, nom: "Services Plus", logo: "SP", employes: 67, masseSalariale: 145000, dernierePaie: "2024-01-14", statut: "actif", evolution: 15.7, admin: "Ibrahima Ndiaye"
    }
  ];
  
  const renderMainContent = () => {
    if (activeLink === 'manage-companies') {
      return (
        <EntrepriseList 
          entreprises={entreprises} 
        />
      );
    }

    if (activeLink === 'users') {
      return (
        <UserList />
      );
    }

    return (
      <DefaultDashboardContent 
        globalStats={globalStats} 
        evolutionEntreprises={evolutionEntreprises}
        repartitionSectorielle={repartitionSectorielle}
        evolutionMasseSalariale={evolutionMasseSalariale}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={notifications} />

      <div className="flex flex-1">
        
        <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} />

        <main className="flex-1 p-6 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}