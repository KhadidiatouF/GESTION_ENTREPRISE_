
const BASE_URL = "http://localhost:4004"; 

export const apiUsers ={
  getUsers : async () => {
    const accessToken = localStorage.getItem('accessToken')
  try {

    const response = await fetch(`${BASE_URL}/users`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des tâches");
    return await response.json();
  }catch (error) {
      console.error('Erreur lors du fetch des utilisateurs:', error);
      throw error; 
    }
  },

  getOneUser : async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/users/${id}`,
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


   getUsersByEntreprise: async (entrepriseId) => {
        try {
            const response = await fetch(`${BASE_URL}/users?entrepriseId=${entrepriseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Ajoutez vos headers d'authentification si nécessaire
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    },

  updateUser : async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
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

    deleteUser : async (id) => {
        const accessToken = localStorage.getItem('accessToken')

    try {
        await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE", headers: {'Authorization': `Bearer ${accessToken}` }});
    } catch (error) {
        console.error(error);
        throw error;
    }
    },

  loginUser : async (login, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    const data = await response.json();

    if (!data.error) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('userId', data.tokens.user.id);
      localStorage.setItem('userName', data.tokens.user.nom);
      localStorage.setItem('userPrenom', data.tokens.user.prenom);
      localStorage.setItem('userRole', data.tokens.user.role);
      localStorage.setItem('entrepriseId', data.tokens.user.entrepriseId);

      

      return { success: true, user: data.tokens.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Erreur API:", error);
    return { success: false, error: "Impossible de contacter le serveur" };
  }
},

 createUsers: async (userData) => {
  try {
    const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const data = await res.json();  // <-- récupère le JSON
    if (!res.ok) {
      console.error("Erreur API:", data);
      return { success: false, error: data.message || "Erreur API" };
    }

    return { success: true, user: data.data };
  } catch (err) {
    console.error("Erreur inscription:", err);
    return { success: false, error: "Impossible de contacter le serveur" };
  }
}

}