const BASE_URL = "http://localhost:4004";


export const ApiPaiement = {
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
    console.log(" Envoi des données:", paiementData); // Debug
    
    const response = await fetch(`${BASE_URL}/paiement`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paiementData),
    });
    
    const responseData = await response.json();
    console.log(" Réponse brute:", responseData); 
    
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || "Erreur inconnue";
      throw new Error(errorMessage);
    }
    
    return responseData;
  } catch (error) {
    console.error(" Erreur complète:", error);
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
  },

 getPaiements: async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${BASE_URL}/paiement`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Erreur récupération paiements:", error);
      return [];
    }
  },

  createPaiement: async (data) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${BASE_URL}/paiement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du paiement");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur API createPaiement:", error);
      throw error;
    }
  },

  deletePaiement: async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${BASE_URL}/paiement/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du paiement");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur API deletePaiement:", error);
      throw error;
    }
  },
};





