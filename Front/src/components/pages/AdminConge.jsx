import React, { useEffect, useState } from 'react';
import { apiConge } from '../../api/apiConge';

export default function AdminConges() {
  const [conges, setConges] = useState([]);

  useEffect(() => {
    apiConge.getAllConge().then(res => setConges(res));
  }, []);

  const handleStatut = async (id, statut) => {
    await apiConge.updateConge(id, { statut });
    setConges(conges.map(c => c.id === id ? { ...c, statut } : c));
  };

  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          <th>Employé</th>
          <th>Nature</th>
          <th>Dates</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {conges.map(c => (
          <tr key={c.id}>
            <td>{c.nomEmploye}</td>
            <td>{c.nature}</td>
            <td>{c.dateDebut} - {c.dateFin}</td>
            <td>{c.statut}</td>
            <td>
              {c.statut === 'en_attente' && (
                <>
                  <button onClick={() => handleStatut(c.id, 'approuvé')} className="bg-green-500 text-white px-2 py-1 rounded">Approuver</button>
                  <button onClick={() => handleStatut(c.id, 'refusé')} className="bg-red-500 text-white px-2 py-1 rounded ml-1">Refuser</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
