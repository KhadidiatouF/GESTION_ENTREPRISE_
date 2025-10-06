import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, AlertCircle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { ApiPaiement } from '../../api/apiPaiement';
import { apiPointage } from '../../api/apiPointage';

export default function ModalPaiement({ isOpen, onClose, payslip, onSuccess }) {
  const [montant, setMontant] = useState('');
  const [methode, setMethode] = useState('ESPECES');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsPresence, setStatsPresence] = useState(null);

  useEffect(() => {
    if (isOpen && payslip) {
      setMontant(payslip.montantRestant.toString());
      loadStatsPresence();
    }
  }, [isOpen, payslip]);

  const loadStatsPresence = async () => {
    if (!payslip || payslip.employe.typeContrat !== 'JOURNALIER') return;

    try {
      const response = await apiPointage.getStatistiques(
        payslip.employe.id,
        payslip.payrun.dateDebut,
        payslip.payrun.dateFin
      );
      setStatsPresence(response.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  if (!isOpen || !payslip) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const montantNumber = parseFloat(montant);

    if (!montantNumber || montantNumber <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }

    if (montantNumber > payslip.montantRestant) {
      setError(`Le montant ne peut pas dépasser le reste à payer (${formatCurrency(payslip.montantRestant)})`);
      return;
    }

    if (!date) {
      setError('Veuillez sélectionner une date');
      return;
    }

    try {
      setLoading(true);
      
      const paiementData = {
        payslipId: payslip.id,
        caisseId: parseInt(localStorage.getItem('userId')),
        date: new Date(date).toISOString(),
        montant: montantNumber,
        methode,
        reference: reference || null,
        note: note || null
      };

      await ApiPaiement.effectuerPaiement(paiementData);
      
      onSuccess();
    } catch (err) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaiementPartiel = () => {
    const moitie = (payslip.montantRestant / 2).toFixed(0);
    setMontant(moitie);
  };

  const handlePaiementComplet = () => {
    setMontant(payslip.montantRestant.toString());
  };

  const salaireJournalier = payslip.jourTravaille > 0 
    ? payslip.montant / payslip.jourTravaille 
    : payslip.payrun.salaire;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Effectuer un paiement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {payslip.employe.prenom} {payslip.employe.nom}
                </h3>
                <p className="text-sm text-gray-600">Matricule: {payslip.employe.matricule}</p>
                <p className="text-sm text-gray-600">Fonction: {payslip.employe.fonction || 'Non spécifiée'}</p>
                <p className="text-sm text-gray-600">
                  Période: {formatDate(payslip.payrun.dateDebut)} - {formatDate(payslip.payrun.dateFin)}
                </p>
                <p className="text-sm font-medium text-blue-700 mt-1">
                  Type: {payslip.employe.typeContrat}
                </p>
              </div>
            </div>
          </div>

          {payslip.employe.typeContrat === 'JOURNALIER' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">Calcul basé sur la présence</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-yellow-700">Jours travaillés:</p>
                      <p className="text-lg font-bold text-yellow-900">{payslip.jourTravaille} jours</p>
                    </div>
                    <div>
                      <p className="text-yellow-700">Salaire journalier:</p>
                      <p className="text-lg font-bold text-yellow-900">{formatCurrency(salaireJournalier)}</p>
                    </div>
                  </div>
                  {statsPresence && (
                    <div className="mt-3 pt-3 border-t border-yellow-300">
                      <p className="text-xs text-yellow-800 mb-2">Détails présence:</p>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          Présents: {statsPresence.presents}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-orange-600" />
                          Retards: {statsPresence.retards}
                        </span>
                        <span className="flex items-center gap-1">
                          <X className="w-3 h-3 text-red-600" />
                          Absents: {statsPresence.absents}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-yellow-700 mt-2">
                    Total = {payslip.jourTravaille} × {formatCurrency(salaireJournalier)} = {formatCurrency(payslip.montant)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(payslip.montant)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-green-600">Déjà payé</p>
              <p className="text-xl font-bold text-green-900 mt-1">{formatCurrency(payslip.totalPaye)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm font-medium text-red-600">Reste à payer</p>
              <p className="text-xl font-bold text-red-900 mt-1">{formatCurrency(payslip.montantRestant)}</p>
            </div>
          </div>

          {payslip.paiements && payslip.paiements.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Historique des paiements</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {payslip.paiements.map((paiement) => (
                  <div key={paiement.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">
                      {formatDate(paiement.date)} - {paiement.caisse.prenom} {paiement.caisse.nom}
                    </span>
                    <span className="font-semibold text-green-600">{formatCurrency(paiement.montant)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à payer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  min="0"
                  max={payslip.montantRestant}
                  step="100"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Entrez le montant"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePaiementPartiel}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  50% ({formatCurrency(payslip.montantRestant / 2)})
                </button>
                <button
                  type="button"
                  onClick={handlePaiementComplet}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Montant complet ({formatCurrency(payslip.montantRestant)})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement <span className="text-red-500">*</span>
              </label>
              <select 
                value={methode} 
                onChange={(e) => setMethode(e.target.value)} 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="ESPECES">Espèces</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="WAVE">Wave</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="N° transaction, reçu bancaire..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (optionnel)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Commentaires..."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Confirmer le paiement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}