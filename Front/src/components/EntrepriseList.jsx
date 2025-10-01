import { Edit, Eye, MoreVertical, Plus, Search, RefreshCw, User, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { ApiEntreprise } from '../api/apiEntreprise';
import { useNavigate } from 'react-router-dom';
import ModalEntreprise from './modalEntreprise';
import ModalEntrepriseDetails from './modalDetail';

export default function EntrepriseList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [entreprises, setEntreprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('6mois');
    const navigate = useNavigate()

    const [selectedEntrepriseId, setSelectedEntrepriseId] = useState(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState(null);


    

    const getEvolutionColor = (evolution) => {
        return evolution >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatutColor = (statut) => {
        switch(statut) {
            case 'actif': return 'bg-green-100 text-green-800 border-green-200';
            case 'suspendu': return 'bg-red-100 text-red-800 border-red-200';
            case 'inactif': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleAddEntreprise = (entreprise) => {
        // setSelectedEntreprise(null);
    setSelectedEntrepriseId(entreprise.id);

        setIsModalOpen(true);
    };

    const handleEditEntreprise = (entreprise) => {
        setSelectedEntreprise(entreprise);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEntreprise(null);
    };

    const handleModalSuccess = () => {
        fetchEntreprises();
        handleCloseModal();
    };

    const handleDeleteEntreprise = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
            try {
                await ApiEntreprise.deleteEntreprise(id);
                setEntreprises(entreprises.filter(e => e.id !== id));
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
                alert('Erreur lors de la suppression de l\'entreprise: ' + err.message);
            }
        }
    };

    // const fetchEntreprises = async () => {
    //     try {
            
    //         setLoading(true);
    //         setError(null);
    //         const data = await ApiEntreprise.getEntreprise(); 
    //         console.log('Entreprises reçues:', data);

    //         if (data && data.data && Array.isArray(data.data)) {
    //             setEntreprises(data.data);
    //         } else if (data && data.entreprises && Array.isArray(data.entreprises)) {
    //             setEntreprises(data.entreprises);
    //         } else if (Array.isArray(data)) {
    //             setEntreprises(data);
    //         } else {
    //             console.error('Format de données inattendu:', data);
    //             setEntreprises([]);
    //         }
    //     } catch (err) {
    //         console.error('Erreur lors du chargement des entreprises:', err);
    //         setError(err.message || 'Erreur lors du chargement');
    //         setEntreprises([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchEntreprises = async () => {
    try {
        setLoading(true);
        setError(null);

        const response = await ApiEntreprise.getEntreprise(); 
        console.log('Réponse API:', response);

        let entreprisesArray = [];

        if (response && Array.isArray(response.data)) {
            entreprisesArray = response.data;
        } else if (response && Array.isArray(response.entreprises)) {
            entreprisesArray = response.entreprises;
        } else if (response && response.id) {
            entreprisesArray = [response];
        }

        setEntreprises(entreprisesArray);

    } catch (err) {
        console.error('Erreur lors du chargement des entreprises:', err);
        setError(err.message || 'Erreur lors du chargement');
        setEntreprises([]);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchEntreprises();
    }, [selectedPeriod]);

    const filteredEntreprises = Array.isArray(entreprises) ? entreprises.filter(entreprise => {
        const nom = entreprise.nom || '';
        const admin = entreprise.admin || '';
        return nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
               admin.toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];

    const handleUser = (entreprise) => {
        navigate("/UserList", { 
            state: { 
                entrepriseId: entreprise.id,
                entrepriseNom: entreprise.nom  
            } 
        });
    };

   const handleViewDetails = (entreprise) => {
        setSelectedDetails(entreprise);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
    setSelectedDetails(null);
    setIsDetailsOpen(false);
  };



    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Entreprises</h2>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={fetchEntreprises}
                            disabled={loading}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={handleAddEntreprise} 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvelle entreprise</span>
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise ou un administrateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select 
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1mois">1 mois</option>
                        <option value="3mois">3 mois</option>
                        <option value="6mois">6 mois</option>
                        <option value="1an">1 an</option>
                    </select>
                </div>

                {loading && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600">
                            <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4" />
                            Chargement des entreprises...
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employés</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masse salariale</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évolution</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        
                        {!loading && filteredEntreprises.length > 0 && filteredEntreprises.map((item) => (

                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden mr-4">
                                                {item.logo ? (
                                                <img
                                                src={`http://localhost:4004${item.logo.startsWith('/uploads/') ? item.logo : `/uploads/${item.logo}`}`}
                                                alt={`${item.nom} logo`}
                                                className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">
                                                    {item.nom?.charAt(0)?.toUpperCase() || 'E'}
                                                </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.nom}</div>
                                            {/* <div className="text-xs text-gray-500">Admin: {item.admin}</div> */}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                     {item.employes ? item.employes.length : 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(item.masseSalariale || 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${getEvolutionColor(item.evolution || 0)}`}>
                                        {item.evolution > 0 ? '+' : ''}{item.evolution || 0}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(item.statut)}`}>
                                        {item.statut?.charAt(0).toUpperCase() + item.statut?.slice(1) || 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => handleUser(item)} 
                                            className="p-1 text-orange-600 hover:text-orange-900" 
                                            title="Gérer les utilisateurs"
                                        >
                                            <User className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleViewDetails(item)}
                                            className="p-1 text-green-600 hover:text-green-900" 
                                            title="Voir les détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditEntreprise(item)}
                                            className="p-1 text-blue-600 hover:text-blue-900" 
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEntreprise(item.id)}
                                            className="p-1 text-red-600 hover:text-red-900" 
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredEntreprises.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
                                    {searchTerm ? 
                                        `Aucune entreprise trouvée pour la recherche "${searchTerm}".` :
                                        'Aucune entreprise disponible.'
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal d'ajout/modification d'entreprise */}
            {isModalOpen && (
                <ModalEntreprise 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    entreprise={selectedEntreprise}
                    onSuccess={handleModalSuccess}
                    entrepriseId={selectedEntrepriseId} 
                />
            )}

            {isDetailsOpen && (
            <ModalEntrepriseDetails
                isOpen={isDetailsOpen}
                onClose={handleCloseDetails}
                entreprise={selectedDetails}
            />
        )}

        </div>
    );
}