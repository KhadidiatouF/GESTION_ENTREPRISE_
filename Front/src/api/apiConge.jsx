const BASE_URL = "http://localhost:4004";

export const apiConge = {
  demandeConge: async (data) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/conges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Erreur lors de la demande de congé");
    return await response.json();
  },

  getCongesEmploye: async (employeId) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/conges/employe/${employeId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des congés");
    return await response.json();
  },

  getAllConges: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/conges`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des congés");
    return await response.json();
  },

  updateStatut: async (id, statut, commentaireAdmin) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/conges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ statut, commentaireAdmin })
    });
    if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");
    return await response.json();
  }
};
