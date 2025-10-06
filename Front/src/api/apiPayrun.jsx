const BASE_URL = "http://localhost:4004"; 

export const apiPayrun = {
 getPayrun: async (entrepriseId) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await fetch(`${BASE_URL}/payrun?entrepriseId=${entrepriseId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Erreur lors du fetch des payruns");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
},


  getOnePayrun: async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/payrun/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error("Erreur lors du fetch du payrun");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  addPayrun: async (payrun) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/payrun`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payrun),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updatePayrun: async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/payrun/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deletePayrun: async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await fetch(`${BASE_URL}/payrun/${id}`, { 
        method: "DELETE", 
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  genererBulletins: async (payrunId) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/payrun/${payrunId}/generer-bulletins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la génération");
      }
      
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
