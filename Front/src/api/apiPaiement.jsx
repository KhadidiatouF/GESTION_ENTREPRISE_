const BASE_URL = "http://localhost:4004";


export const ApiPaiement = {
  // Récupérer tous les payslips de l'entreprise du caissier
  getPayslipsEntreprise: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    try {
      const response = await fetch(`${BASE_URL}/paiement/payslips?caisseId=${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors de la récupération des payslips");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  effectuerPaiement: async (paiementData) => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Jeton d'accès non trouvé. Veuillez vous reconnecter.");
    }
    
    try {
      const response = await fetch(`${BASE_URL}/paiement`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(paiementData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur ${response.status}: ${errorText}`);
        throw new Error("Erreur API : " + (errorText || response.statusText));
      }
      
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getHistoriquePaiements: async (filters = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${BASE_URL}/paiement/historique${queryParams ? `?${queryParams}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors de la récupération de l'historique");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getStatistiques: async (mois) => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    const queryParams = new URLSearchParams({ 
      caisseId: userId, 
      ...(mois && { mois }) 
    }).toString();
    
    try {
      const response = await fetch(`${BASE_URL}/paiement/statistiques?${queryParams}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors de la récupération des statistiques");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getOnePaiement: async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${BASE_URL}/paiement/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors de la récupération du paiement");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  annulerPaiement: async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${BASE_URL}/paiement/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'annulation du paiement");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};