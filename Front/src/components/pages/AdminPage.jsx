import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Plus, Filter, Calendar, Eye } from 'lucide-react';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';
import EmployeList from '../Listes/EmployeList';
import ModalEmploye from '../Modals/modalEmploy';
import ModalPayrun from '../Modals/modalPayrun';
import ModalVoirBulletin from '../Modals/modalVoirbulletinPaie';
import { apiEmploye } from '../../api/apiEmploy';
import { apiPayrun } from '../../api/apiPayrun';
import PaiementList from '../Listes/PaiementList';

const AdminEntreprise = () => {
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('employes'); // 'employes' ou 'payruns'
  
  // États pour les employés
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  
  // États pour les payruns
  const [payruns, setPayruns] = useState([]);
  const [isPayrunModalOpen, setIsPayrunModalOpen] = useState(false);
  const [bulletinModal, setBulletinModal] = useState({ isOpen: false, payslip: null });
    // const [activeLink, setActiveLink] = useState("employes");

  
  const entrepriseId = Number(localStorage.getItem('entrepriseId'));

  const [stats, setStats] = useState({
    totalEmployes: 0,
    employesActifs: 0,
    nouveauxCeMois: 0,
    departements: 0
  });

    const adminLinks = [
    { id: "employes", label: "Employés", icon: Users, component: <EmployeList /> },
    { id: "payruns", label: "Cycles de Paie", icon: Calendar, component: <PaiementList /> }
  ];


  const fetchEmployes = async () => {
    setLoading(true);
    try {
      const response = await apiEmploye.getEmploye();
      let data = [];

      if (response && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const filteredData = data.filter(e => e.entrepriseId === entrepriseId);
      setEmployes(filteredData);

      const totalEmployes = filteredData.length;
      const employesActifs = filteredData.filter(e => e.statut === 'actif' || e.estActif).length;
      const now = new Date();
      const nouveauxCeMois = filteredData.filter(e => {
        const date = new Date(e.dateEmbauche);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;
      const departements = [...new Set(filteredData.map(e => e.fonction))].length;

      setStats({
        totalEmployes,
        employesActifs,
        nouveauxCeMois,
        departements
      });

    } catch (error) {
      console.error('Erreur lors du chargement des employés :', error);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

 const fetchPayruns = async () => {
    setLoading(true);
    try {
      const data = await apiPayrun.getPayrun(entrepriseId);
      setPayruns(data.data || []); // selon ta structure FormaterResponse
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'employes') {
      fetchEmployes();
    } else {
      fetchPayruns();
    }
  }, [activeTab]);

  const handleAddEmploye = () => {
    setSelectedEmploye(null);
    setIsModalOpen(true);
  };

  const handleEditEmploye = (employe) => {
    setSelectedEmploye(employe);
    setIsModalOpen(true);
  };

  const handleDeleteEmploye = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await apiEmploye.deleteEmploye(id);
        fetchEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression :', error);
      }
    }
  };

  const handleToggleStatut = async (id, currentStatut) => {
    try {
      const currentEmploye = employes.find(e => e.id === id);
      const newStatut = currentStatut === 'actif' ? 'inactif' : 'actif';

      await apiEmploye.updateEmploye(id, {
        ...currentEmploye,
        statut: newStatut
      });

      fetchEmployes();
    } catch (error) {
      console.error('Erreur lors du changement de statut :', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };


const handleGenererBulletins = async (payrunId) => {
  if (!window.confirm('Voulez-vous générer les bulletins pour ce cycle de paie ?')) {
    return;
  }
  
  try {
    setLoading(true);
    const response = await apiPayrun.genererBulletins(payrunId);
    
    if (response.success) {
      alert(response.message);
      fetchPayruns(); // Recharger la liste
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert(error.message || 'Erreur lors de la génération des bulletins');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={2} />

      <div className="flex flex-1">
        {/* <Sidebar activeLink="employes" /> */}
                <Sidebar links={adminLinks} />


        <main className="flex-1 p-6">
          {/* Navigation par onglets */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('employes')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'employes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  Employés
                </button>
                <button
                  onClick={() => setActiveTab('payruns')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payruns'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Cycles de Paie
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu de l'onglet Employés */}
          {activeTab === 'employes' && (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total employés</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalEmployes}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employés actifs</p>
                      <p className="text-2xl font-bold text-green-600">{stats.employesActifs}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.nouveauxCeMois}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Départements</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.departements}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Filter className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des employés */}
              <EmployeList
                employes={employes}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterDepartement={filterDepartement}
                setFilterDepartement={setFilterDepartement}
                onRefresh={fetchEmployes}
                onAddEmploye={handleAddEmploye}
                onEditEmploye={handleEditEmploye}
                onDeleteEmploye={handleDeleteEmploye}
                onToggleStatut={handleToggleStatut}
                entrepriseId={entrepriseId} 
              />
            </>
          )}

          {/* Contenu de l'onglet Cycles de Paie */}
          {activeTab === 'payruns' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cycles de Paie</h2>
                <button
                  onClick={() => setIsPayrunModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouveau cycle</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p>Chargement...</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {payruns.map(payrun => (
                    <div key={payrun.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            {formatDate(payrun.dateDebut)} - {formatDate(payrun.dateFin)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Type: <span className="font-medium">{payrun.typeContrat}</span> | 
                            Salaire: <span className="font-medium">{formatCurrency(payrun.salaire)}</span>
                            {payrun.joursTravailles && ` | ${payrun.joursTravailles} jours`}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {payrun.payslips?.length || 0} bulletins
                        </span>
                         {(!payrun.payslips || payrun.payslips.length === 0) && (
                          <button
                            onClick={() => handleGenererBulletins(payrun.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Générer les bulletins
                          </button>
                        )}
          
                      </div>

                      {payrun.payslips && payrun.payslips.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Bulletins générés:</h4>
                          <div className="grid gap-2">
                            {payrun.payslips.map(payslip => (
                              <div key={payslip.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {payslip.employe.prenom} {payslip.employe.nom}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatCurrency(payslip.montant)} - 
                                    <span className={`ml-2 ${
                                      payslip.statut === 'PAYE' ? 'text-green-600' :
                                      payslip.statut === 'PARTIEL' ? 'text-orange-600' :
                                      'text-yellow-600'
                                    }`}>
                                      {payslip.statut}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => setBulletinModal({ isOpen: true, payslip })}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Voir</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal d'ajout/modification d'employé */}
      <ModalEmploye 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employe={selectedEmploye}
        entrepriseId={entrepriseId}
        onSuccess={fetchEmployes}
      />

      {/* Modal de création de payrun */}
      <ModalPayrun
        isOpen={isPayrunModalOpen}
        onClose={() => setIsPayrunModalOpen(false)}
        onSuccess={fetchPayruns}
        entrepriseId={entrepriseId}
      />

      {/* Modal de visualisation des bulletins */}
      <ModalVoirBulletin
        isOpen={bulletinModal.isOpen}
        onClose={() => setBulletinModal({ isOpen: false, payslip: null })}
        payslip={bulletinModal.payslip}
      />
    </div>
  );
};

export default AdminEntreprise;