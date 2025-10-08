import React, { useState, useEffect } from 'react';
import { Calendar, Send, Info } from 'lucide-react';
// Assurez-vous que l'importation de l'API est correcte pour les erreurs
import { apiConge } from '../../api/apiConge'; 
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';

export default function DemandeConge({notifications, adminLinks}) {
  const [nature, setNature] = useState('Congé payé');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [commentaire, setCommentaire] = useState(''); // Ajout d'un champ commentaire
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fonction de validation des dates
  const isFormValid = () => {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      
      if (!dateDebut || !dateFin) {
          setMessage('Veuillez sélectionner les dates de début et de fin.');
          setIsError(true);
          return false;
      }
      if (start >= end) {
          setMessage('La date de fin doit être strictement postérieure à la date de début.');
          setIsError(true);
          return false;
      }
      if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
          setMessage('La date de début ne peut pas être dans le passé.');
          setIsError(true);
          return false;
      }
      
      setMessage(null);
      setIsError(false);
      return true;
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Envoyer l'objet complet à l'API, y compris le commentaire
      await apiConge.demandeConge({
        nature,
        dateDebut,
        dateFin,
        commentaire 
      });
      
      setMessage('✅ Votre demande de congé a été envoyée avec succès et est en attente d\'approbation.');
      setIsError(false);
      
      // Réinitialisation du formulaire après succès
      setNature('Congé payé');
      setDateDebut('');
      setDateFin('');
      setCommentaire('');

    } catch (err) {
      console.error(err);
      setMessage(`❌ Erreur lors de l'envoi : ${err.message || 'Problème de connexion au serveur.'}`);
      setIsError(true);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Effacer le message après un court délai s'il n'y a pas d'erreur persistante
  useEffect(() => {
    if (message && !isError) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, isError]);

  return (
    // 1. Conteneur principal: flex-col
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={notifications || 0} />

      {/* 2. Conteneur Sidebar + Main Content: flex-row */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={adminLinks} />
        
        {/* 3. Main Content: flex-1, overflow-y-auto */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            
            {/* En-tête de la page */}
            <div className="flex items-center mb-8">
                <Calendar className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Demande de Congé</h1>
            </div>

            {/* Notification Message */}
            {message && (
                <div 
                    className={`p-4 rounded-lg mb-6 flex items-start ${isError ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}
                    role="alert"
                >
                    <Info className="w-5 h-5 mt-1 mr-3" />
                    <p className='font-medium'>{message}</p>
                </div>
            )}

            {/* Formulaire Amélioré */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <p className="text-gray-600 mb-6">Veuillez remplir les informations pour soumettre votre demande d'absence.</p>

                {/* Champ Nature */}
                <div className="mb-6">
                    <label htmlFor="nature" className="block text-sm font-medium text-gray-700 mb-2">
                        Nature du Congé <span className="text-red-500">*</span>
                    </label>
                    <select 
                        id="nature"
                        value={nature} 
                        onChange={e => setNature(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out bg-gray-50"
                        required
                    >
                        <option value="Congé payé">Congé payé</option>
                        <option value="Maladie">Maladie</option>
                        <option value="Sans solde">Sans solde</option>
                        <option value="Congé exceptionnel">Congé exceptionnel (Mariage, naissance...)</option>
                    </select>
                </div>
                
                {/* Champ Date de Début */}
                <div className="mb-6">
                    <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Début <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="date" 
                        id="dateDebut"
                        value={dateDebut} 
                        onChange={e => setDateDebut(e.target.value)} 
                        onBlur={isFormValid} // Vérification à la sortie du champ
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                        required 
                    />
                </div>
                
                {/* Champ Date de Fin */}
                <div className="mb-6">
                    <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Fin <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="date" 
                        id="dateFin"
                        value={dateFin} 
                        onChange={e => setDateFin(e.target.value)} 
                        onBlur={isFormValid} // Vérification à la sortie du champ
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                        required 
                    />
                </div>

                {/* Champ Commentaire */}
                <div className="mb-6">
                    <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire (Optionnel)
                    </label>
                    <textarea
                        id="commentaire"
                        value={commentaire}
                        onChange={e => setCommentaire(e.target.value)}
                        rows="3"
                        placeholder="Précisez la raison ou les arrangements si nécessaire..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out resize-none"
                    />
                </div>

                {/* Bouton de soumission */}
                <button 
                    type="submit"
                    disabled={!dateDebut || !dateFin || isSubmitting || isError}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-200 
                        ${!dateDebut || !dateFin || isSubmitting || isError 
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                        }`}
                >
                    {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                    {isSubmitting ? 'Envoi en cours...' : 'Soumettre la Demande'}
                </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}