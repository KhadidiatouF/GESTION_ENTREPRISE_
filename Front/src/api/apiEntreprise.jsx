
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

// Dans apiEntreprise.jsx

addEntreprise: async (formData) => {
  const accessToken = localStorage.getItem("accessToken");

  // Vérification ajoutée
  if (!accessToken) {
      throw new Error("Jeton d'accès non trouvé. Veuillez vous reconnecter.");
  }
  
  try {
    const response = await fetch(`${BASE_URL}/entreprises`, {
      method: "POST",
      // Laissez l'objet headers tel quel, mais vérifiez l'en-tête.
      headers: { 
        // Pas besoin d'ajouter 'Content-Type: multipart/form-data', le navigateur le fait.
        'Authorization': `Bearer ${accessToken}` 
      },
      body: formData,
    });
    
    // **VÉRIFICATION CRUCIALE :** // Si l'API renvoie un 400 ou 401, l'erreur contient des informations utiles.
    if (!response.ok) {
        // Tenter de lire l'erreur du serveur
        const errorText = await response.text();
        // Afficher le code d'état et le message d'erreur du serveur
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
      method: "PUT", // Ou "PATCH" selon votre API back-end
      headers: { 
        // RETRAIT du header "Content-Type": "application/json"
        // car nous envoyons un FormData qui gère son propre Content-Type (multipart/form-data)
        'Authorization': `Bearer ${accessToken}` 
      },
      body: updates, // updates est maintenant un objet FormData
    });
    // Ajout de la vérification ici pour capturer les erreurs 4xx et 5xx
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