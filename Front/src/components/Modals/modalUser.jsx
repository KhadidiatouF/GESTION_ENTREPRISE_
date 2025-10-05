import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiUsers } from '../../api/apiUsers';

const ModalUser = ({ isOpen, onClose, user, onSuccess, entrepriseId }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    role: '',
    login: '',
    password: '',
    adresse: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation du formulaire
  const validate = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    } else if (formData.nom.length > 50) {
      newErrors.nom = "Le nom ne doit pas dépasser 50 caractères";
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    } else if (formData.prenom.length > 50) {
      newErrors.prenom = "Le prénom ne doit pas dépasser 50 caractères";
    }

    // Validation du rôle
    if (!formData.role) {
      newErrors.role = "Le rôle est requis";
    }

    // Validation du login
    if (!formData.login.trim()) {
      newErrors.login = "Le login est requis";
    } else if (formData.login.length < 3) {
      newErrors.login = "Le login doit contenir au moins 3 caractères";
    } else if (formData.login.length > 30) {
      newErrors.login = "Le login ne doit pas dépasser 30 caractères";
    }

    // Validation du mot de passe (seulement pour la création)
    if (!user && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation de l'adresse (optionnelle)
    if (formData.adresse.length > 200) {
      newErrors.adresse = "L'adresse ne doit pas dépasser 200 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        role: user.role || '',
        login: user.login || '',
        password: '',
        adresse: user.adresse || '',
        email: user.email || ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        role: '',
        login: '',
        password: '',
        adresse: '',
        email: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validate()) return;

  //   setLoading(true);
  //   try {
  //     const submitData = { ...formData };
      
  //     if (user && !submitData.password) {
  //       delete submitData.password;
  //     }

  //     if (user) {
  //       await apiUsers.updateUser(user.id, submitData);
  //     } else {
  //       await apiUsers.createUsers(submitData);
  //     }

  //     onSuccess();
  //     onClose();
  //   } catch (err) {
  //     console.error("Erreur :", err);
  //     setErrors(prev => ({ 
  //       ...prev, 
  //       submit: err.message || "Échec de l'opération. Veuillez vérifier les champs." 
  //     }));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setLoading(true);
  try {
    const submitData = { ...formData, entrepriseId }; 
    
    if (user && !submitData.password) {
      delete submitData.password;
    }

    if (user) {
      await apiUsers.updateUser(user.id, submitData);
    } else {
      await apiUsers.createUsers(submitData);
    }

    onSuccess();
    onClose();
  } catch (err) {
    console.error("Erreur :", err);
    setErrors(prev => ({ 
      ...prev, 
      submit: err.message || "Échec de l'opération. Veuillez vérifier les champs." 
    }));
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
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Diop"
              />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Amadou"
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
            </div>
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="ADMIN">ADMIN</option>
              <option value="CASSIER">CASSIER</option>
              <option value="VIGILE">VIGILE</option>
              <option value="EMPLOYE">EMPLOYE</option>

            </select>
            {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Login */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="login"
                value={formData.login}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: adiop"
              />
              {errors.login && <p className="mt-1 text-sm text-red-500">{errors.login}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {!user && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={user ? "Laisser vide pour garder l'ancien" : "Min. 6 caractères"}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
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
              placeholder="Ex: amadou.diop@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse (optionnel)
            </label>
            <input 
              type="text" 
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Sicap Liberté, Dakar"
            />
            {errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>}
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enregistrement...
                </>
              ) : (
                user ? 'Modifier l\'utilisateur' : 'Créer l\'utilisateur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUser;