import React, { useEffect, useState } from 'react'
import { apiUsers } from '../../api/apiUsers';
import { Edit, MoreVertical, Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';
import { useLocation } from 'react-router-dom';
import ModalUser from '../Modals/modalUser';
import Pagination from '../../components/Pagination'; // 🔸 ton composant réutilisable de pagination

export default function UserList({ notifications, activeLink, setActiveLink }) {
  const location = useLocation();
  const entrepriseId = location.state?.entrepriseId || null;
  const entrepriseNom = location.state?.entrepriseNom || 'Non défini';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatutFromBoolean = (estActif) => (estActif ? 'actif' : 'inactif');

  const getStatutColor = (estActif) => {
    const statut = getStatutFromBoolean(estActif);
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactif':
        return 'bg-gray-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleToggleStatut = async (id, estActif) => {
    try {
      const currentUser = users.find((u) => u.id === id);
      const updatedUser = await apiUsers.updateUser(id, {
        ...currentUser,
        estActif: !estActif,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser.data : user))
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut :', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
    //   setError(null);
      const data = await apiUsers.getUsers();

      if (data && data.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Format de données inattendu:', data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    //   setError(err.message || 'Erreur lors du chargement');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          (user.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.login || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.role || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEntreprise = entrepriseId ? user.entrepriseId === entrepriseId : true;

        return matchesSearch && matchesEntreprise;
      })
    : [];

  // Découpage local pour la pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await apiUsers.deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de l\'utilisateur: ' + err.message);
      }
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    fetchUsers();
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 m-6 flex-1">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  title="Actualiser"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, rôle ou login..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!loading && currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          {/* Entreprise : {entrepriseNom || 'Non défini'} */}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.role || 'Non défini'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.login || 'Non défini'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatut(user.id, user.estActif)}
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer transition-colors hover:opacity-80 ${getStatutColor(user.estActif)}`}
                          title={user.estActif ? 'Cliquez pour désactiver' : 'Cliquez pour activer'}
                        >
                          {user.estActif ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Modifier"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Supprimer"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Options">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      {searchTerm ? `Aucun utilisateur trouvé pour "${searchTerm}".` : 'Aucun utilisateur disponible.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isModalOpen && (
        <ModalUser
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          onSuccess={handleModalSuccess}
          entrepriseId={entrepriseId}
          entrepriseNom={entrepriseNom}
        />
      )}
    </div>
  );
}
