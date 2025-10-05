import React from 'react';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';
import PaiementList from '../Listes/PaiementList';

const Caissier = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header notifications={3} />
      
      <div className="flex flex-1">
        <Sidebar activeLink="paiements" />
        
        <main className="flex-1 p-6">
          <PaiementList />
        </main>
      </div>
    </div>
  );
};

export default Caissier;