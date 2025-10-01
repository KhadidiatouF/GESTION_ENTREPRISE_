import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, 
  Clock, Download, RefreshCw, User, AlertCircle, DollarSign
} from 'lucide-react';
// import { ApiPaiement } from '../api/apiPaiement';
import ModalPaiement from './modalPaiement';
import { ApiPaiement } from '../api/apiPaiement';

export default function PaiementList() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    paiementsEnAttente: 0,
    paiementsEffectues: 0,
    paiementsPartiels: 0,
    montantTotal: 0,
    montantPayé: 0
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'PAYE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIEL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'PAYE': return <CheckCircle className="w-4 h-4" />;
      case 'PARTIEL': return <AlertCircle className="w-4 h-4" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'PAYE': return 'Payé';
      case 'PARTIEL': return 'Partiel';
      case 'EN_ATTENTE': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiPaiement.getPayslipsEntreprise();
      console.log("Réponse API Paiement:", response);
      
      if (response && response.data) {
        setPayslips(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message || 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiques = async () => {
    try {
      const response = await ApiPaiement.getStatistiques(selectedMonth);
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchStatistiques();
  }, [selectedMonth]);

  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = (
      payslip.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employe.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filterStatut === 'tous' || payslip.statut === filterStatut;
    
    // Filtrer par mois
    const payslipMonth = new Date(payslip.payrun.dateFin).toISOString().slice(0, 7);
    const matchesMonth = !selectedMonth || payslipMonth === selectedMonth;
    
    return matchesSearch && matchesFilter && matchesMonth;
  });

  const handleEffectuerPaiement = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayslip(null);
  };

  const handlePaiementSuccess = () => {
    fetchPayslips();
    fetchStatistiques();
    handleCloseModal();
  };

  const exportToCSV = () => {
    const csvData = filteredPayslips.map(p => ({
      'Matricule': p.employe.matricule,
      'Nom': `${p.employe.prenom} ${p.employe.nom}`,
      'Fonction': p.employe.fonction || '-',
      'Montant': p.montant,
      'Payé': p.totalPaye,
      'Restant': p.montantRestant,
      'Statut': getStatutLabel(p.statut),
      'Période': `${formatDate(p.payrun.dateDebut)} - ${formatDate(p.payrun.dateFin)}`
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.paiementsEnAttente}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Effectués</p>
              <p className="text-2xl font-bold text-green-600">{stats.paiementsEffectues}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.montantTotal)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Déjà payé</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(stats.montantPayé)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Paiements des salaires</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchPayslips}
                disabled={loading}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={exportToCSV}
                disabled={filteredPayslips.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <select 
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PARTIEL">Partiel</option>
              <option value="PAYE">Payé</option>
            </select>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm"><strong>Erreur:</strong> {error}</p>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <RefreshCw className="animate-spin w-6 h-6 text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 text-sm">
                    {searchTerm ? 
                      `Aucun paiement trouvé pour "${searchTerm}".` :
                      'Aucun paiement disponible pour cette période.'
                    }
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payslip.employe.prenom} {payslip.employe.nom}
                          </div>
                          <div className="text-xs text-gray-500">{payslip.employe.matricule}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(payslip.payrun.dateDebut)} - {formatDate(payslip.payrun.dateFin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payslip.montant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(payslip.totalPaye)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(payslip.montantRestant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(payslip.statut)}`}>
                        {getStatutIcon(payslip.statut)}
                        {getStatutLabel(payslip.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payslip.montantRestant > 0 ? (
                        <button
                          onClick={() => handleEffectuerPaiement(payslip)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Effectuer paiement
                        </button>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">✓ Payé</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de paiement */}
      {showModal && selectedPayslip && (
        <ModalPaiement
          isOpen={showModal}
          onClose={handleCloseModal}
          payslip={selectedPayslip}
          onSuccess={handlePaiementSuccess}
        />
      )}
    </div>
  );
}