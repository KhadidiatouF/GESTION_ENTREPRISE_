// ModalVoirBulletin.jsx
import React from 'react';
import { X, User, Calendar, DollarSign, FileText } from 'lucide-react';

export default function ModalVoirBulletin({ isOpen, onClose, payslip }) {
  if (!isOpen || !payslip) return null;

  // Sécuriser l'accès aux données imbriquées
  const employe = payslip?.employe || {};
  const payrun = payslip?.payrun || {};

  const formatCurrency = (amount) => {
    const value = amount || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch  {
      return 'Date invalide';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Bulletin de Paie
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Informations employé */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informations de l'employé
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="text-base font-medium text-gray-900">
                  {employe.prenom || 'N/A'} {employe.nom || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Matricule</p>
                <p className="text-base font-medium text-gray-900">{employe.matricule || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fonction</p>
                <p className="text-base font-medium text-gray-900">{employe.fonction || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type de contrat</p>
                <p className="text-base font-medium text-gray-900">{employe.typeContrat || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Période de paie */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Période de paie
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Du</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(payrun.dateDebut)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Au</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(payrun.dateFin)}
                </p>
              </div>
              {payslip.jourTravaille > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Jours travaillés</p>
                  <p className="text-base font-medium text-gray-900">{payslip.jourTravaille} jours</p>
                </div>
              )}
            </div>
          </div>

          {/* Détails financiers */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Détails financiers
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-700">Salaire brut</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(payslip.montant)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-700">Déjà payé</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(payslip.totalPaye)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4">
                <span className="text-gray-900 font-medium">Montant restant</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(payslip.montantRestant)}
                </span>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="text-center">
            <span className={`inline-block px-6 py-3 rounded-full text-base font-semibold ${
              payslip.statut === 'PAYE' 
                ? 'bg-green-100 text-green-800' 
                : payslip.statut === 'PARTIEL'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {payslip.statut === 'PAYE' ? 'Payé' : payslip.statut === 'PARTIEL' ? 'Partiellement payé' : 'En attente'}
            </span>
          </div>

          {/* Bouton fermer */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}