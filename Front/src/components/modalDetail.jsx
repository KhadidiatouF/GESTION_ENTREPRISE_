import React from 'react';
import { X } from 'lucide-react';

const ModalEntrepriseDetails = ({ isOpen, onClose, entreprise }) => {
  if (!isOpen || !entreprise) return null;
  const nombreEmployes = Array.isArray(entreprise.employes) ? entreprise.employes.length : 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'entreprise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div><strong>Nom:</strong> {entreprise.nom}</div>
          <div><strong>Admin:</strong> {entreprise.admin}</div>
          <div><strong>Adresse:</strong> {entreprise.adresse}</div>
          <div><strong>Email:</strong> {entreprise.email}</div>
          <div><strong>Téléphone:</strong> {entreprise.telephone}</div>
          <div><strong>Site web:</strong> <a href={entreprise.site} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">{entreprise.site}</a></div>
          <div><strong>Statut:</strong> {entreprise.statut}</div>
          <div><strong>Nombre d'employés:</strong> {nombreEmployes || 0}</div>
          <div><strong>Masse salariale:</strong> {entreprise.masseSalariale || 0} XOF</div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEntrepriseDetails;
