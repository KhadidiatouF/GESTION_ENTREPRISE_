import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Plus, Filter } from 'lucide-react';
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import EmployeList from './EmployeList';
import ModalEmploye from './modalEmploy';
import { apiEmploye } from '../api/apiEmploy';

const AdminEntreprise = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const entrepriseId = Number(localStorage.getItem('entrepriseId'));

  const [stats, setStats] = useState({
    totalEmployes: 0,
    employesActifs: 0,
    nouveauxCeMois: 0,
    departements: 0
  });

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

  useEffect(() => {
    fetchEmployes();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={2} />

      <div className="flex flex-1">
        <Sidebar activeLink="employes" />

        <main className="flex-1 p-6">
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
    </div>
  );
};

export default AdminEntreprise;
