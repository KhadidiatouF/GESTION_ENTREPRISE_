import React, { useState } from 'react';
import { X, Calendar, DollarSign, Users } from 'lucide-react';

export default function ModalPayrun({ isOpen, onClose, onSuccess, entrepriseId }) {
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    salaire: '',
    typeContrat: 'MENSUELLE',
    joursTravailles: '',
    entrepriseId: entrepriseId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salaire' || name === 'joursTravailles' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      const payload = {
        ...formData,
        entrepriseId: Number(entrepriseId)
      };

      // Supprimer joursTravailles si ce n'est pas un contrat journalier
      if (formData.typeContrat !== 'JOURNALIER') {
        delete payload.joursTravailles;
      }

      const response = await fetch('http://localhost:4004/payrun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du cycle');
      }

      onSuccess();
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        dateDebut: '',
        dateFin: '',
        salaire: '',
        typeContrat: 'MENSUELLE',
        joursTravailles: '',
        entrepriseId: entrepriseId
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Créer un cycle de paie</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Type de contrat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Type de contrat
            </label>
            <select
              name="typeContrat"
              value={formData.typeContrat}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MENSUELLE">Mensuel</option>
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="JOURNALIER">Journalier</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début
              </label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Salaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Salaire {formData.typeContrat === 'JOURNALIER' ? 'journalier' : 'de base'} (XOF)
            </label>
            <input
              type="number"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Ex: 150000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Jours travaillés - uniquement pour JOURNALIER */}
          {formData.typeContrat === 'JOURNALIER' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de jours travaillés
              </label>
              <input
                type="number"
                name="joursTravailles"
                value={formData.joursTravailles}
                onChange={handleChange}
                required={formData.typeContrat === 'JOURNALIER'}
                min="1"
                placeholder="Ex: 22"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2">
                Le salaire total sera calculé : {formData.salaire} XOF × {formData.joursTravailles || 0} jours = {(formData.salaire * (formData.joursTravailles || 0)).toLocaleString()} XOF
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Les bulletins de paie seront générés automatiquement pour tous les employés actifs ayant un contrat de type <strong>{formData.typeContrat}</strong>.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Création en cours...' : 'Créer le cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}