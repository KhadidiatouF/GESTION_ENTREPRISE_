import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp, Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';

const EmployePage = ({notifications, adminLinks}) => {
  const [pointages, setPointages] = useState([]);
  const [filteredPointages, setFilteredPointages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [employeId, setEmployeId] = useState(null);
  
  const userId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    fetchEmployeId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (employeId) {
      fetchPointages();
      fetchStatistiques();
      fetchQRCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, employeId]);

  useEffect(() => {
    filterAndSortPointages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointages, filterStatut, searchTerm, sortOrder]);

  const fetchEmployeId = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `http://localhost:4004/employes/by-user/${userId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les informations de l\'employé');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setEmployeId(data.data.employeId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employeId:', error);
    }
  };

  const fetchPointages = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      const [year, month] = selectedMonth.split('-');
      const dateDebut = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
      const dateFin = new Date(parseInt(year), parseInt(month), 0).toISOString();
      
      const response = await fetch(
        `http://localhost:4004/pointage/employe/${employeId}?dateDebut=${dateDebut}&dateFin=${dateFin}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      
      const data = await response.json();
      setPointages(data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des pointages:', error);
      setPointages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiques = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:4004/pointage/employe/${employeId}/statistiques?mois=${selectedMonth}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        calculateLocalStats();
        return;
      }
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      calculateLocalStats();
    }
  };

  const fetchQRCode = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `http://localhost:4004/employes/by-user/${userId}/qrcode`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.qrCodeImage) {
        setQrCodeImage(data.qrCodeImage);
      }
    } catch (error) {
      console.error('Erreur QR code:', error);
    }
  };

  const calculateLocalStats = () => {
    if (pointages.length === 0) {
      setStats({
        total: 0,
        presents: 0,
        retards: 0,
        absents: 0,
        tauxPresence: 0,
        tauxRetard: 0
      });
      return;
    }

    const total = pointages.length;
    const presents = pointages.filter(p => p.statut === 'PRESENT').length;
    const retards = pointages.filter(p => p.statut === 'RETARD').length;
    const absents = pointages.filter(p => p.statut === 'ABSENT').length;
    
    setStats({
      total,
      presents,
      retards,
      absents,
      tauxPresence: total > 0 ? Math.round((presents / total) * 100) : 0,
      tauxRetard: total > 0 ? Math.round((retards / total) * 100) : 0
    });
  };

  const filterAndSortPointages = () => {
    let filtered = [...pointages];

    if (filterStatut !== 'ALL') {
      filtered = filtered.filter(p => p.statut === filterStatut);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => {
        const dateStr = formatDate(p.date).toLowerCase();
        return dateStr.includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredPointages(filtered);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return 'N/A';

    return validDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'RETARD':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return <CheckCircle className="w-5 h-5" />;
      case 'RETARD':
        return <Clock className="w-5 h-5" />;
      case 'ABSENT':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'PRESENT': return 'Présent';
      case 'RETARD': return 'En retard';
      case 'ABSENT': return 'Absent';
      default: return 'Inconnu';
    }
  };

  const telechargerQRCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrCodeImage.startsWith('data:image') ? qrCodeImage : `data:image/png;base64,${qrCodeImage}`;
      link.download = 'mon_qrcode_pointage.png';
      link.click();
    }
  };

  const resetFilters = () => {
    setFilterStatut('ALL');
    setSearchTerm('');
    setSortOrder('desc');
  };

  if (!employeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos informations...</p>
        </div>
      </div>
    );
  }

  // --- CORRECTION DU LAYOUT : Main Content enveloppé dans <main> et non dans des div supplémentaires ---

  return (
    // 1. Conteneur principal: flex-col
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={notifications || 0} />

      {/* 2. Conteneur Sidebar + Main Content: flex-row */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={adminLinks}  />
    
        {/* 3. Main Content: flex-1, overflow-y-auto, et tout le contenu de la page s'y trouve */}
        <main className="flex-1 p-6 overflow-y-auto"> 
          <div className="max-w-6xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Pointages</h1>
              <p className="text-gray-600">Consultez votre historique de présence et vos statistiques</p>
            </div>

            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 mb-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-2xl font-bold mb-2">Mon QR Code de Pointage</h3>
                  <p className="text-green-100 mb-4">
                    Présentez ce code au vigile chaque matin pour pointer
                  </p>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                  >
                    Voir mon QR Code
                  </button>
                </div>
                {qrCodeImage && (
                  <div className="bg-white p-4 rounded-xl">
                    <img 
                      src={qrCodeImage.startsWith('data:image') ? qrCodeImage : `data:image/png;base64,${qrCodeImage}`} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Jours travaillés</p>
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">jours pointés ce mois</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-800">Présences à l'heure</p>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">{stats.presents || 0}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.tauxPresence || 0}% de présence</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-orange-800">Total Retards</p>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-900">{stats.retards || 0}</p>
                  <p className="text-xs text-orange-600 mt-1">{stats.tauxRetard || 0}% de retards</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-800">Taux d'Assiduité</p>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{stats.tauxPresence || 0}%</p>
                  <p className="text-xs text-blue-600 mt-1">Sur les jours pointés</p>
                </div>
              </div>
            )}

            {/* Historique Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Historique des pointages</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Filter className="w-5 h-5" />
                      Filtres
                      {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rechercher une date
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Ex: lundi, janvier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={filterStatut}
                          onChange={(e) => setFilterStatut(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="ALL">Tous les statuts</option>
                          <option value="PRESENT">Présent</option>
                          <option value="RETARD">En retard</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ordre
                        </label>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="desc">Plus récent d'abord</option>
                          <option value="asc">Plus ancien d'abord</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>

                    {(filterStatut !== 'ALL' || searchTerm) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                        <span className="font-medium">Filtres actifs:</span>
                        {filterStatut !== 'ALL' && (
                          <span className="px-3 py-1 bg-white border border-gray-300 rounded-full">
                            Statut: {getStatutLabel(filterStatut)}
                          </span>
                        )}
                        {searchTerm && (
                          <span className="px-3 py-1 bg-white border border-gray-300 rounded-full">
                            Recherche: "{searchTerm}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : filteredPointages.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      {pointages.length === 0 
                        ? 'Aucun pointage pour cette période' 
                        : 'Aucun résultat trouvé avec ces filtres'}
                    </p>
                    {pointages.length > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      **{filteredPointages.length}** pointage{filteredPointages.length > 1 ? 's' : ''} affiché{filteredPointages.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-3">
                      {filteredPointages.map(pointage => (
                        <div
                          key={pointage.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getStatutColor(pointage.statut).replace('text-', 'bg-').replace('100', '200')}`}>
                              {getStatutIcon(pointage.statut)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatDate(pointage.date)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Heure : {pointage.heureArrivee ? formatTime(pointage.heureArrivee) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatutColor(pointage.statut)}`}
                          >
                            {getStatutLabel(pointage.statut)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl relative w-full max-w-sm">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Mon QR Code de Pointage
            </h2>

            {qrCodeImage ? (
              <img
                src={
                  qrCodeImage.startsWith('data:image')
                    ? qrCodeImage
                    : `data:image/png;base64,${qrCodeImage}`
                }
                alt="QR Code"
                className="w-56 h-56 mx-auto mb-6 border-4 border-green-500 rounded-lg p-1"
              />
            ) : (
              <p className="text-gray-600 text-center py-4">
                Chargement...
              </p>
            )}

            <div className="flex justify-center">
              <button
                onClick={telechargerQRCode}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployePage;