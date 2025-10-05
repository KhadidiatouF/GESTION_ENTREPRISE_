
const BASE_URL = "http://localhost:4004"; 

export const apiPayslip ={
  getPayslip : async () => {
    const accessToken = localStorage.getItem('accessToken')
  try {

    const response = await fetch(`${BASE_URL}/payslip`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des payslip");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },

  getOnePayslip: async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/payslip/${id}`,
        {
            method: 'GET',
            headers:{'Authorization': `Bearer ${accessToken}`}
        });
    if (!response.ok) throw new Error("Erreur lors du fetch des payslip");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
 },

  addPayslip: async (Payslip) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/payslip`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(Payslip),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
 },

  updatePayslip : async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    const response = await fetch(`${BASE_URL}/payslip/${id}`, {
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

  deletePayslip : async (id) => {
    const accessToken = localStorage.getItem('accessToken')

  try {
    await fetch(`${BASE_URL}/payslip/${id}`, { method: "DELETE", headers: {'Authorization': `Bearer ${accessToken}` }});
  } catch (error) {
    console.error(error);
    throw error;
  }
 }

}