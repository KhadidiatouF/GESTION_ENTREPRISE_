const BASE_URL = "http://localhost:4004"; 

export const apiEmploye = {
  getEmploye: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const entrepriseId = localStorage.getItem('entrepriseId'); // ← AJOUTEZ CECI
    
  
    try {
      const response = await fetch(`${BASE_URL}/employes?entrepriseId=${entrepriseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(' Erreur détaillée:', errorData);
        throw new Error(errorData.message || "Erreur lors du fetch des employes");
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur complète:', error);
      throw error;
    }
  },

  getAllEmployes: async (entrepriseId) => {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/employes?entrepriseId=${entrepriseId}`, { // ← CORRIGEZ ICI aussi
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
    return await response.json();
  },

  getOneEmploye: async (id) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${BASE_URL}/employes/${id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error("Erreur lors du fetch de l'employé");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  addEmploye: async (employe) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${BASE_URL}/employes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(employe),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateEmploye: async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${BASE_URL}/employes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteEmploye: async (id) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${BASE_URL}/employes/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getQRCode: async (employeId) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/employes/${employeId}/qrcode`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du QR Code');
    return await response.json();
  },

  regenerateQRCode: async (employeId) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/employes/${employeId}/regenerate-qrcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    if (!response.ok) throw new Error('Erreur lors de la régénération du QR Code');
    return await response.json();
  }
}