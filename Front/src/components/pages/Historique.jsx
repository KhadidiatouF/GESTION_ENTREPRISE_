import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { apiPointage } from '../../api/apiPointage';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';

export default function HistoriquePointage({adminLinks}) {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    recherche: ''
  });

  const entrepriseId = Number(localStorage.getItem('entrepriseId'));

  useEffect(() => {
    loadPointages();
  }, [filters.dateDebut, filters.dateFin]);

  const loadPointages = async () => {
    setLoading(true);
    try {
      const response = await apiPointage.getByEntreprise(
        entrepriseId,
        filters.dateDebut,
        filters.dateFin
      );
      setPointages(response.data);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Présent
          </span>
        );
      case 'RETARD':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Retard
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pointagesFiltres = pointages.filter(p => {
    if (!filters.recherche) return true;
    const recherche = filters.recherche.toLowerCase();
    return (
      p.employe.prenom.toLowerCase().includes(recherche) ||
      p.employe.nom.toLowerCase().includes(recherche) ||
      p.employe.matricule.toLowerCase().includes(recherche)
    );
  });

  const stats = {
    total: pointagesFiltres.length,
    presents: pointagesFiltres.filter(p => p.statut === 'PRESENT').length,
    retards: pointagesFiltres.filter(p => p.statut === 'RETARD').length,
    absents: pointagesFiltres.filter(p => p.statut === 'ABSENT').length
  };

  return (

     <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header notifications={2} />
    
          <div className="flex flex-1">
                    <Sidebar links={adminLinks} />
    
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Pointages</h1>
        <p className="text-gray-600">Suivi des présences et retards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Présents</p>
          <p className="text-2xl font-bold text-green-900">{stats.presents}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm text-orange-600 mb-1">Retards</p>
          <p className="text-2xl font-bold text-orange-900">{stats.retards}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-600 mb-1">Absents</p>
          <p className="text-2xl font-bold text-red-900">{stats.absents}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.recherche}
                onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
                placeholder="Nom, prénom, matricule..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scanné par
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : pointagesFiltres.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucun pointage trouvé
                  </td>
                </tr>
              ) : (
                pointagesFiltres.map((pointage) => (
                  <tr key={pointage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {pointage.employe.prenom[0]}{pointage.employe.nom[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {pointage.employe.prenom} {pointage.employe.nom}
                          </p>
                          <p className="text-xs text-gray-500">{pointage.employe.fonction}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pointage.employe.matricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(pointage.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatTime(pointage.heureArrivee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatutBadge(pointage.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pointage.scannePar ? 
                        `${pointage.scannePar.prenom} ${pointage.scannePar.nom}` : 
                        'Automatique'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    </div>

  );
}