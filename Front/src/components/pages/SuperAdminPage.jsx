import { useState } from 'react';
import { 
  Building2, Users, DollarSign, TrendingUp, Bell, Settings, LogOut, Activity, ChevronDown, FileText, Crown 
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import EntrepriseList from '../Listes/EntrepriseList';
import UserList from '../Listes/UserList';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';
import ContentGraphe from '../ContentGraphe';

const DefaultDashboardContent = ({ globalStats, evolutionEntreprises, repartitionSectorielle,evolutionMasseSalariale,formatCurrency }) => {


  return (
    // <div className="space-y-6">
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    //     <StatCard
    //       title="Entreprises totales"
    //       value={globalStats.totalEntreprises}
    //       icon={Building2}
    //       iconBgColor="bg-blue-100"
    //       evolutionText="+3 ce mois"
    //       evolutionType="good"
    //     />
    //     <StatCard
    //       title="Employés totaux"
    //       value={globalStats.totalEmployes.toLocaleString()}
    //       icon={Users}
    //       iconBgColor="bg-orange-100"
    //       evolutionText="+127 ce mois"
    //       evolutionType="good"
    //     />
    //     <StatCard
    //       title="Masse salariale totale"
    //       value={formatCurrency(globalStats.masseSalarialeTotale)}
    //       icon={DollarSign}
    //       iconBgColor="bg-purple-100"
    //       evolutionText={`${globalStats.evolutionMois > 0 ? '+' : ''}${globalStats.evolutionMois}% ce mois`}
    //       evolutionType={globalStats.evolutionMois >= 0 ? 'good' : 'bad'}
    //       evolutionValue={globalStats.evolutionMois}
    //     />
    //     <StatCard
    //       title="Taux d'activité"
    //       value="94.2%"
    //       icon={Activity}
    //       iconBgColor="bg-red-100"
    //       evolutionText="Très bon"
    //       evolutionType="good"
    //     />
    //   </div>

    //   {/* Graphiques analytiques */}
    //   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
    //     {/* Croissance des Entreprises (Area Chart) */}
    //     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Entreprises</h3>
    //       <ResponsiveContainer width="100%" height={200}>
    //         <AreaChart data={evolutionEntreprises}>
    //           <defs>
    //             <linearGradient id="colorEntreprises" x1="0" y1="0" x2="0" y2="1">
    //               <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
    //               <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
    //             </linearGradient>
    //           </defs>
    //           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    //           <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} labelStyle={{color: '#374151'}} />
    //           <Area type="monotone" dataKey="entreprises" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEntreprises)" strokeWidth={2} />
    //         </AreaChart>
    //       </ResponsiveContainer>
    //     </div>

    //     {/* Croissance des Employés (Line Chart) */}
    //     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Employés</h3>
    //       <ResponsiveContainer width="100%" height={200}>
    //         <LineChart data={evolutionEntreprises}>
    //           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    //           <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} labelStyle={{color: '#374151'}} />
    //           <Line type="monotone" dataKey="employes" stroke="#10B981" strokeWidth={3} dot={{r: 5, fill: '#10B981'}} />
    //         </LineChart>
    //       </ResponsiveContainer>
    //     </div>

    //     {/* Répartition sectorielle (Pie Chart) */}
    //     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Secteur</h3>
    //       <ResponsiveContainer width="100%" height={200}>
    //         <PieChart>
    //           <Pie
    //             data={repartitionSectorielle}
    //             cx="50%"
    //             cy="50%"
    //             innerRadius={40}
    //             outerRadius={80}
    //             paddingAngle={2}
    //             dataKey="nombre"
    //           >
    //             {repartitionSectorielle.map((entry, index) => (
    //               <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
    //             ))}
    //           </Pie>
    //           <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}} />
    //         </PieChart>
    //       </ResponsiveContainer>
    //       <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
    //         {repartitionSectorielle.map((item, index) => (
    //           <div key={index} className="flex items-center space-x-2">
    //             <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: item.couleur}}></div>
    //             <span className="text-gray-600">{item.secteur} ({item.nombre})</span>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Graphiques supplémentaires */}
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
    //     {/* Évolution masse salariale (Area Chart) */}
    //     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-900 mb-4">Masse Salariale Mensuelle</h3>
    //       <ResponsiveContainer width="100%" height={250}>
    //         <AreaChart data={evolutionMasseSalariale}>
    //           <defs>
    //             <linearGradient id="colorMasse" x1="0" y1="0" x2="0" y2="1">
    //               <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
    //               <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
    //             </linearGradient>
    //           </defs>
    //           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    //           <XAxis dataKey="semaine" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <YAxis 
    //             axisLine={false} 
    //             tickLine={false} 
    //             tick={{fontSize: 12, fill: '#6B7280'}}
    //             tickFormatter={(value) => `${(value/1000)}k`}
    //           />
    //           <Tooltip 
    //             contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}}
    //             labelStyle={{color: '#374151'}}
    //             formatter={(value) => [`${formatCurrency(value)}`, 'Montant']}
    //           />
    //           <Area 
    //             type="monotone" 
    //             dataKey="montant" 
    //             stroke="#8B5CF6" 
    //             fillOpacity={1} 
    //             fill="url(#colorMasse)" 
    //             strokeWidth={2} 
    //           />
    //         </AreaChart>
    //       </ResponsiveContainer>
    //     </div>

    //     {/* Statistiques de paiements (Bar Chart) */}
    //     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements par Semaine</h3>
    //       <ResponsiveContainer width="100%" height={250}>
    //         <BarChart data={evolutionMasseSalariale}>
    //           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    //           <XAxis dataKey="semaine" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
    //           <Tooltip 
    //             contentStyle={{backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px'}}
    //             labelStyle={{color: '#374151'}}
    //             formatter={(value) => [value, 'Paiements']}
    //           />
    //           <Bar dataKey="paiements" fill="#F59E0B" radius={[4, 4, 0, 0]} />
    //         </BarChart>
    //       </ResponsiveContainer>
    //     </div>
    //   </div>
    // </div>

      <ContentGraphe globalStats = {globalStats}  evolutionEntreprises={evolutionEntreprises} repartitionSectorielle={repartitionSectorielle}  evolutionMasseSalariale ={evolutionMasseSalariale} formatCurrency={formatCurrency}/>
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