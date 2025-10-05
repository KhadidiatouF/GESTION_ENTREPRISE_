import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { ApiEntreprise } from '../../api/apiEntreprise';

const ModalEntreprise = ({ isOpen, onClose, entreprise, onSuccess }) => {
  const [formData, setFormData] = useState({
    logo: null,
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    site: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation du formulaire
  const validate = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de l'entreprise est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.nom.length > 100) {
      newErrors.nom = "Le nom ne doit pas dépasser 100 caractères";
    }

    // Validation du téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!/^[+]?[\d\s()-]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du site web
    if (!formData.site.trim()) {
      newErrors.site = "Le site web est requis";
    } else if (!/^https?:\/\/.+\..+/.test(formData.site)) {
      newErrors.site = "Format d'URL invalide (doit commencer par http:// ou https://)";
    }

    // Validation des adresses (optionnelles mais limitées)
    if (formData.adresse.length > 200) {
      newErrors.adresse = "L'adresse 1 ne doit pas dépasser 200 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (entreprise) {
      setFormData({
        logo: entreprise.logo || null,
        nom: entreprise.nom || '',
        adresse: entreprise.adresse || '',
        telephone: entreprise.telephone || '',
        email: entreprise.email || '',
        site: entreprise.site || ''
      });
      if (entreprise.logo) {
        setLogoPreview(entreprise.logo);
      }
    } else {
      setFormData({
        logo: null,
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        site: ''
      });
      setLogoPreview(null);
    }
  }, [entreprise]);

  // Ne rien afficher si le modal n'est pas ouvert
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

    const handleLogoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // 1. Stocke l'objet File pour l'envoi
        setFormData(prev => ({ ...prev, logo: file })); 

        // 2. Utilise FileReader pour la prévisualisation
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result); // Base64 pour l'affichage uniquement
        };
        reader.readAsDataURL(file); 
      } else {
          // Gérer le cas où l'utilisateur annule la sélection
          setFormData(prev => ({ ...prev, logo: null })); 
          setLogoPreview(null);
      }
    };
      // Dans ModalEntreprise.jsx

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Validation côté client
  if (!validate()) return;

  setLoading(true);
  try {
    const submitData = new FormData();
    submitData.append("nom", formData.nom);
    submitData.append("adresse", formData.adresse);
    submitData.append("telephone", formData.telephone);
    submitData.append("email", formData.email);
    submitData.append("site", formData.site);


    if (formData.logo instanceof File) {
      submitData.append("logo", formData.logo);
    } 
    if (entreprise) {
      await ApiEntreprise.updateEntreprise(entreprise.id, submitData);
    } else {
      await ApiEntreprise.addEntreprise(submitData);
    }

    onSuccess();
  } catch (err) {
    console.error("Erreur :", err);
    setErrors(prev => ({ ...prev, submit: err.message || "Échec de l'opération. Veuillez vérifier les champs." }));
  } finally {
    setLoading(false);
  }
};

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {entreprise ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message Global */}
        {errors.submit && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo de l'entreprise
            </label>
            <div className="flex items-center space-x-4">
              {/* Prévisualisation du logo */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              {/* Bouton de sélection */}
              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoPreview ? 'Changer le logo' : 'Sélectionner un logo'}
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG ou JPEG (Max. 5MB)
                </p>
                {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
              </div>
            </div>
          </div>

          {/* Nom de l'entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: TechCorp SARL"
            />
            {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
          </div>

          {/* Adresse 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse 1 (optionnel)
            </label>
            <input 
              type="text" 
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: 123 Avenue Pompidou"
            />
            {errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>}
          </div>

       

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+221 XX XXX XX XX"
              />
              {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="contact@entreprise.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Site Web */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Web <span className="text-red-500">*</span>
            </label>
            <input 
              type="url" 
              name="site"
              value={formData.site}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://www.exemple.com"
            />
            {errors.site && <p className="mt-1 text-sm text-red-500">{errors.site}</p>}
          </div>

          {/* Buttons */}
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
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enregistrement...
                </>
              ) : (
                entreprise ? 'Modifier l\'entreprise' : 'Créer l\'entreprise'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEntreprise;