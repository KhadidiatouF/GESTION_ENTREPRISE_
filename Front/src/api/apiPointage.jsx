const API_URL = 'http://localhost:4004';

export const apiPointage = {
  scanner: async (employeId, scanneParId) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeId, scanneParId })
    });
    return response.json();
  },

  getByEmploye: async (employeId, dateDebut, dateFin) => {
    const params = new URLSearchParams();
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);

    const response = await fetch(`${API_URL}/employe/${employeId}?${params.toString()}`);
    return response.json();
  },

  getByEntreprise: async (entrepriseId, dateDebut, dateFin) => {
    const params = new URLSearchParams({ entrepriseId: String(entrepriseId) });
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);

    const response = await fetch(`${API_URL}/entreprise?${params.toString()}`);
    return response.json();
  },

  getJoursPresents: async (employeId, dateDebut, dateFin) => {
    const params = new URLSearchParams({ dateDebut, dateFin });
    const response = await fetch(`${API_URL}/jours-presents/${employeId}?${params.toString()}`);
    return response.json();
  },

  getStatistiques: async (employeId, dateDebut, dateFin) => {
    const params = new URLSearchParams({ dateDebut, dateFin });
    const response = await fetch(`${API_URL}/statistiques/${employeId}?${params.toString()}`);
    return response.json();
  },

  getPointagesDuJour: async (entrepriseId) => {
    const params = new URLSearchParams({ entrepriseId: String(entrepriseId) });
    const response = await fetch(`${API_URL}/aujourd-hui?${params.toString()}`);
    return response.json();
  },

  marquerAbsents: async (entrepriseId, date) => {
    const response = await fetch(`${API_URL}/marquer-absents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entrepriseId, date: date || new Date().toISOString() })
    });
    return response.json();
  },

  getEmployeInfo: async (employeId) => {
    const response = await fetch(`${API_URL}/employe-info/${employeId}`);
    return response.json();
  }
};