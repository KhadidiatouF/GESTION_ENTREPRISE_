
const BASE_URL = "http://localhost:4004"; 

export const ApiEntreprise ={
  getEntreprise : async () => {
    const accessToken = localStorage.getItem('accessToken')
  try {

    const response = await fetch(`${BASE_URL}/entreprises`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des tâches");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },

  getOneEntreprise : async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/entreprises/${id}`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des tâches");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },


addEntreprise: async (formData) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
      throw new Error("Jeton d'accès non trouvé. Veuillez vous reconnecter.");
  }
  
  try {
    const response = await fetch(`${BASE_URL}/entreprises`, {
      method: "POST",
      headers: { 
        'Authorization': `Bearer ${accessToken}` 
      },
      body: formData,
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
 

updateEntreprise : async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/entreprises/${id}`, {
      method: "PUT",
      headers: { 
        'Authorization': `Bearer ${accessToken}` 
      },
      body: updates, 
    });
    if (!response.ok) throw new Error("Erreur API lors de la modification");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
 },

  deleteEntreprise : async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    await fetch(`${BASE_URL}/taches/${id}`, { method: "DELETE", headers: {'Authorization': `Bearer ${accessToken}` }});
  } catch (error) {
    console.error(error);
    throw error;
  }
 },



}