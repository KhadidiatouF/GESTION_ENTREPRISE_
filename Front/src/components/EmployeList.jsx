import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, MoreVertical, 
  RefreshCw, Download
} from 'lucide-react';
import ModalEmploye from './modalEmploy';
import { apiEmploye } from '../api/apiEmploy';

const EmployeList = () => {
  // Récupération de l'entreprise de l'admin connecté depuis le localStorage
  const userEntrepriseId = Number(localStorage.getItem("entrepriseId")) || null;
  const entrepriseNom = localStorage.getItem("entrepriseNom") || 'Non défini';

  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContrat, setFilterContrat] = useState('tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  

  const getStatutFromBoolean = (estActif) => estActif ? 'actif' : 'inactif';

  const getStatutColor = (estActif) => 
    getStatutFromBoolean(estActif) === 'actif'
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';

  const getStatutLabel = (estActif) => estActif ? 'Actif' : 'Inactif';

  const getContratColor = (typeContrat) => {
    const colors = {
      'JOURNALIER': 'bg-blue-100 text-blue-800',
      'HEBDOMADAIRE': 'bg-yellow-100 text-yellow-800',
      'MENSUELLE': 'bg-purple-100 text-purple-800',
    };
    return colors[typeContrat] || 'bg-gray-100 text-gray-800';
  };

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiEmploye.getEmploye();

      if (data && data.data && Array.isArray(data.data)) {
        setEmployes(data.data);
      } else if (data && data.employes && Array.isArray(data.employes)) {
        setEmployes(data.employes);
      } else if (Array.isArray(data)) {
        setEmployes(data);
      } else {
        console.error('Format de données inattendu:', data);
        setEmployes([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError(err.message || 'Erreur lors du chargement');
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, []);

  const filteredEmployes = Array.isArray(employes) ? employes.filter(employe => {
    const matchesSearch = (
      (employe.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employe.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employe.matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employe.fonction || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesContrat = filterContrat === 'tous' || employe.typeContrat === filterContrat;
    const matchesEntreprise = employe.entrepriseId === userEntrepriseId;

    return matchesSearch && matchesContrat && matchesEntreprise;
  }) : [];

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
        setEmployes(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'employé: ' + error.message);
      }
    }
  };

  const handleToggleStatut = async (id, estActif) => {
    try {
      const currentEmploye = employes.find(e => e.id === id);
      const updatedEmploye = await apiEmploye.updateEmploye(id, {
        ...currentEmploye,
        estActif: !estActif,
      });
      setEmployes(prev =>
        prev.map(e => e.id === id ? updatedEmploye.data : e)
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleExport = () => {
    console.log('Exporter les données...');
  };

  const handleModalSuccess = () => {
    fetchEmployes();
    setIsModalOpen(false);
    setSelectedEmploye(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmploye(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 m-6 flex-1">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Employés</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchEmployes}
              disabled={loading}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
            <button 
              onClick={handleAddEmploye}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel employé</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select 
            value={filterContrat}
            onChange={(e) => setFilterContrat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="tous">Tous les contrats</option>
            <option value="JOURNALIER">JOURNALIER</option>
            <option value="MENSUELLE">MENSUELLE</option>
            <option value="HEBDOMADAIRE">HEBDOMADAIRE</option>
          </select>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-green-600">
              <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4" />
              Chargement des employés...
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Erreur:</strong> {error}
            </p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type contrat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && filteredEmployes.length > 0 && filteredEmployes.map((employe) => (
              <tr key={employe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {employe.prenom?.charAt(0)}{employe.nom?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {employe.prenom} {employe.nom}
                      </div>
                      <div className="text-xs text-gray-500">{employe.matricule}</div>
                      <div className="text-xs text-gray-500">
                        Entreprise: {entrepriseNom}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {employe.fonction || 'Non défini'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getContratColor(employe.typeContrat)}`}>
                    {employe.typeContrat || 'Non défini'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatut(employe.id, employe.estActif)}
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer transition-colors hover:opacity-80 ${getStatutColor(employe.estActif)}`}
                    title={employe.estActif ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                  >
                    {getStatutLabel(employe.estActif)}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditEmploye(employe)}
                      className="p-1 text-green-600 hover:text-green-900"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmploye(employe.id)}
                      className="p-1 text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600" 
                      title="Plus d'options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredEmployes.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                  {searchTerm ? 
                    `Aucun employé trouvé pour la recherche "${searchTerm}".` :
                    'Aucun employé disponible.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ModalEmploye 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          employe={selectedEmploye}
          onSuccess={handleModalSuccess}
          entrepriseId={userEntrepriseId} 
        />
      )}
    </div>
  );
};

export default EmployeList;
