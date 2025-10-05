// AdminPayrun.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Eye } from 'lucide-react';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';
import ModalPayrun from '../Modals/modalPayrun';
import ModalVoirBulletin from '../Modals/modalVoirbulletinPaie';

const AdminPayrun = () => {
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulletinModal, setBulletinModal] = useState({ isOpen: false, payslip: null });
//   const [selectedPayrun, setSelectedPayrun] = useState(null);
  const entrepriseId = Number(localStorage.getItem('entrepriseId'));

  const fetchPayruns = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4004/payrun', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        const filtered = data.data.filter(p => p.entrepriseId === entrepriseId);
        setPayruns(filtered);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayruns();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={2} />
      
      <div className="flex flex-1">
        <Sidebar activeLink="payruns" />
        
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Cycles de Paie</h1>
            <button
              onClick={() => setIsModalOpen(true)}
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
        </main>
      </div>

      <ModalPayrun
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayruns}
        entrepriseId={entrepriseId}
      />

      <ModalVoirBulletin
        isOpen={bulletinModal.isOpen}
        onClose={() => setBulletinModal({ isOpen: false, payslip: null })}
        payslip={bulletinModal.payslip}
      />
    </div>
  );
};

export default AdminPayrun;