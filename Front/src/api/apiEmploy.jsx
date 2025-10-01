
const BASE_URL = "http://localhost:4004"; 

export const apiEmploye ={
  getEmploye : async () => {
    const accessToken = localStorage.getItem('accessToken')
  try {

    const response = await fetch(`${BASE_URL}/employes`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des employes");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },

  getOneEmploye: async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/employes/${id}`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des employes");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },

  addEmploye: async (employe) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/employes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(employe),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
 },

  updateEmploye : async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/employes/${id}`, {
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

  deleteEmploye : async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    await fetch(`${BASE_URL}/employes/${id}`, { method: "DELETE", headers: {'Authorization': `Bearer ${accessToken}` }});
  } catch (error) {
    console.error(error);
    throw error;
  }
 }

}