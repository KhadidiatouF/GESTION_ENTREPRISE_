import React, { useState, useEffect } from 'react';
import { X, QrCode as QrCodeIcon } from 'lucide-react';
import QRCodeDisplay from '../QRcode';
import { apiEmploye } from '../../api/apiEmploy';

const ModalEmploye = ({ isOpen, onClose, employe, onSuccess, entrepriseId }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    fonction: '',
    matricule: '',
    estActif: true,
    typeContrat: '',
    entrepriseId: entrepriseId 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdEmploye, setCreatedEmploye] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    } else if (formData.prenom.length > 50) {
      newErrors.prenom = "Le prénom ne doit pas dépasser 50 caractères";
    }

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    } else if (formData.nom.length > 50) {
      newErrors.nom = "Le nom ne doit pas dépasser 50 caractères";
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
    } else if (formData.matricule.length < 3) {
      newErrors.matricule = "Le matricule doit contenir au moins 3 caractères";
    } else if (formData.matricule.length > 20) {
      newErrors.matricule = "Le matricule ne doit pas dépasser 20 caractères";
    }

    if (formData.fonction && formData.fonction.length > 50) {
      newErrors.fonction = "La fonction ne doit pas dépasser 50 caractères";
    }

    if (!formData.typeContrat) {
      newErrors.typeContrat = "Le type de contrat est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (employe) {
      setFormData({
        prenom: employe.prenom || '',
        nom: employe.nom || '',
        fonction: employe.fonction || '',
        matricule: employe.matricule || '',
        estActif: employe.estActif !== undefined ? employe.estActif : true,
        typeContrat: employe.typeContrat || '',
        entrepriseId: localStorage.getItem('entrepriseId'),
      });
    } else {
      setFormData({
        prenom: '',
        nom: '',
        fonction: '',
        matricule: '',
        estActif: true,
        typeContrat: '',
        entrepriseId: localStorage.getItem('entrepriseId'),
      });
    }

    setErrors({});
  }, [employe, isOpen, entrepriseId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setLoading(true);
  try {
    const submitData = { 
      ...formData, 
      entrepriseId: parseInt(localStorage.getItem('entrepriseId')),
    };

    let result;
    if (employe) {
      result = await apiEmploye.updateEmploye(employe.id, submitData);
    } else {
      result = await apiEmploye.addEmploye(submitData);
      console.log('📦 Résultat création:', result); // Debug
      console.log('🔍 QR Code reçu:', result.data?.qrCode); // Debug
      
      if (result.data && result.data.qrCode) {
        setCreatedEmploye(result.data);
        setShowQRModal(true);
      } else {
        console.warn('⚠️ Pas de QR Code dans la réponse');
      }
    }

    onSuccess();
    if (employe) {
      onClose();
    }
  } catch (err) {
    console.error("Erreur :", err);
    setErrors(prev => ({ 
      ...prev, 
      submit: err.response?.data?.message || "Échec de l'opération" 
    }));
  } finally {
    setLoading(false);
  }
};
//  const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!validate()) return;

//   setLoading(true);
//   try {
//     const submitData = { 
//       ...formData, 
//       entrepriseId: parseInt(localStorage.getItem('entrepriseId')),
//     };

//     let result;
//     if (employe) {
//       result = await apiEmploye.updateEmploye(employe.id, submitData);
//       onSuccess();
//       onClose();
//     } else {
//       result = await apiEmploye.addEmploye(submitData);
//     onSuccess();
//     onClose();

//     // Afficher le QR code après création
//     setTimeout(() => {
//       setCreatedEmploye(result.data); // result.data contient qrCode
//       setShowQRModal(true);
//     }, 100);

//     }
//   } catch (err) {
//     console.error("Erreur :", err);
//     setErrors(prev => ({ 
//       ...prev, 
//       submit: err.response?.data?.message || "Échec de l'opération. Veuillez vérifier les champs." 
//     }));
//   } finally {
//     setLoading(false);
//   }
// };
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCreatedEmploye(null);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {employe ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {errors.submit && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Amadou"
                />
                {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Diop"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matricule <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: EMP001"
                />
                {errors.matricule && <p className="mt-1 text-sm text-red-500">{errors.matricule}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonction (optionnel)
                </label>
                <input 
                  type="text" 
                  name="fonction"
                  value={formData.fonction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Développeur Full Stack"
                />
                {errors.fonction && <p className="mt-1 text-sm text-red-500">{errors.fonction}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat <span className="text-red-500">*</span>
                </label>
                <select 
                  name="typeContrat"
                  value={formData.typeContrat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="JOURNALIER">JOURNALIER</option>
                  <option value="MENSUELLE">MENSUELLE</option>
                  <option value="HEBDOMADAIRE">HEBDOMADAIRE</option>
                </select>
                {errors.typeContrat && <p className="mt-1 text-sm text-red-500">{errors.typeContrat}</p>}
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="estActif"
                    checked={formData.estActif}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Employé actif
                  </span>
                </label>
              </div>
            </div>

            {employe && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedEmploye(employe);
                    setShowQRModal(true);
                  }}
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-900"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  <span className="font-medium">Voir le QR Code</span>
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Enregistrement...
                  </>
                ) : (
                  employe ? 'Modifier l\'employé' : 'Créer l\'employé'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showQRModal && createdEmploye && (
        <QRCodeDisplay
          isOpen={showQRModal}
          onClose={handleCloseQRModal}
          employe={createdEmploye}
        />
      )}
    </>
  );
};

export default ModalEmploye;