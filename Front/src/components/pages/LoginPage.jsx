import React from 'react'
import { useState } from 'react';
import { Eye, EyeOff, Building2, Users, Shield, Lock, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { apiUsers } from '../../api/apiUsers';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
 
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

const handleSubmit = async () => {
  setIsLoading(true);
  setError('');

  if (!formData.login.trim() || !formData.password.trim()) {
    setError('Veuillez remplir tous les champs');
    setIsLoading(false);
    return;
  }

  try {
    const res = await apiUsers.loginUser(formData.login, formData.password);

    if (res.success) {
      const role = res.user.role; // ✅ récupéré depuis backend

      // Redirection selon rôle
      switch (role) {
      case 'SUPER_ADMIN':
      navigate('/super-admin/dashboard');
      break;
    case 'ADMIN':
      navigate('/admin/dashboard');
      break;
    case 'CASSIER':
      navigate('/caissier/dashboard');
      break;
    case 'VIGILE':
      navigate('/vigile/scanner');
      break;
    case 'EMPLOYE':
      navigate('/employe/qrcode');
      
      break;
    default:
      navigate('/');
      }
    } else {
      setError(res.error || 'Login ou mot de passe incorrect');
    }

  } catch (err) {
    setError(err.message || 'Erreur de connexion');
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-white relative">
        <div className="flex flex-col justify-center px-12 py-16 w-full">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-950 rounded-xl flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-950 to-green-950 bg-clip-text text-transparent">
                Entreprise Management
              </h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              La solution moderne de gestion des salaires pour les entreprises d'aujourd'hui
            </p>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-6 flex justify-center">
           <img src="src/assets/Company-amico.png" className='h-[30rem]' alt="" />
          </div>

    
        </div>

        {/* Décoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-green-600 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-blue-100 rounded-tr-full opacity-50"></div>
      </div>

      {/* Section droite - Formulaire de connexion */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white lg:bg-gray-50">
        <div className="w-full max-w-md mx-auto">
        

          {/* Formulaire */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600">Accédez à votre espace de gestion</p>
            </div>

            <div className="space-y-6">
              {/* Champ Login */}
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Votre identifiant"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Champ Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Votre mot de passe"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Bouton de connexion */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-950 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Se connecter</span>
                  </div>
                )}
              </button>
            </div>

           
          </div>


        </div>
      </div>
    </div>
  );
}