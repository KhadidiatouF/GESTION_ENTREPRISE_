import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, 
  Clock, Download, RefreshCw, User, AlertCircle, DollarSign,
  FileDown
} from 'lucide-react';
import ModalPaiement from '../Modals/modalPaiement';
import { ApiPaiement } from '../../api/apiPaiement'; 
import {jsPDF} from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";


export default function PaiementList() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  const [showModal, setShowModal] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    paiementsEnAttente: 0,
    paiementsEffectues: 0,
    paiementsPartiels: 0,
    montantTotal: 0,
    montantPayé: 0
  });


  const getStatutColor = (statut) => {
    switch(statut) {
      case 'PAYE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIEL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'PAYE': return <CheckCircle className="w-4 h-4" />;
      case 'PARTIEL': return <AlertCircle className="w-4 h-4" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };


const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `${formatted.replace(/\s/g, ' ')} FCFA`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return 'N/A';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatutLabel = (statut) => {
  switch(statut) {
    case 'PAYE': return 'Payé';
    case 'PARTIEL': return 'Partiel';
    case 'EN_ATTENTE': return 'En attente';
    default: return 'Inconnu';
  }
};

const getEmployeInfo = (paiement) => {
  const employe = paiement.employe || {};
  return {
    nom: employe.nom || '',
    prenom: employe.prenom || '',
    matricule: employe.matricule || 'N/A',
    fonction: employe.fonction || '-'
  };
};

const getPayrunInfo = (paiement) => {
  const payrun = paiement.payrun || {};
  return {
    dateDebut: new Date(payrun.dateDebut || new Date()),
    dateFin: new Date(payrun.dateFin || new Date())
  };
};
const generatePDF = async (paiement) => {
  try {
    const employe = getEmployeInfo(paiement);
    const payrun = getPayrunInfo(paiement);

    let logoData = null;
    let entrepriseNom = 'Mon Entreprise';
    
    try {
      const entrepriseId = paiement.employe?.entrepriseId || paiement.entrepriseId;
      
      if (entrepriseId) {
        const accessToken = localStorage.getItem('accessToken');
        
        const response = await fetch(`http://localhost:4004/entreprises/${entrepriseId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const entrepriseData = await response.json();
          logoData = entrepriseData.data?.logo || entrepriseData.logo;
          entrepriseNom = entrepriseData.data?.nom || entrepriseData.nom || 'Mon Entreprise';
        }
      }
    } catch (err) {
      console.warn('Impossible de charger le logo de l\'entreprise:', err);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    if (logoData) {
      try {
        let logoBase64 = logoData;
        
        if (logoData.startsWith('http')) {
          logoBase64 = await convertImageToBase64(logoData);
        }
        
        if (logoData.startsWith('/uploads')) {
          logoBase64 = await convertImageToBase64(`http://localhost:4004${logoData}`);
        }
        
        doc.addImage(logoBase64, 'PNG', 15, 7.5, 35, 35);
      } catch (err) {
        console.warn('Erreur lors de l\'ajout du logo:', err);
      }
    }
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    const titleX = logoData ? 60 : pageWidth / 2;
    const titleAlign = logoData ? 'left' : 'center';
    doc.text("FICHE DE PAIE", titleX, 25, { align: titleAlign });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(entrepriseNom, titleX, 35, { align: titleAlign });
    
    
    let yPos = 65;
    
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, 'FD');
    
    doc.setFillColor(219, 234, 254);
    doc.circle(28, yPos + 25, 10, 'F');
    doc.setFillColor(37, 99, 235);
    doc.setFontSize(16);
    doc.text("👤", 28, yPos + 28, { align: 'center' });
    
    const infoX = 45;
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${employe.prenom} ${employe.nom}`, infoX, yPos + 15);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Matricule: ${employe.matricule}`, infoX, yPos + 25);
    doc.text(`Fonction: ${employe.fonction}`, infoX, yPos + 33);
    doc.text(`Période: ${formatDate(payrun.dateDebut)} - ${formatDate(payrun.dateFin)}`, infoX, yPos + 41);

    yPos += 65;
    const cardWidth = (pageWidth - 50) / 3;
    const cardHeight = 35;
    
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(15, yPos, cardWidth, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text("Montant total", 20, yPos + 10);
    
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.setFont(undefined, 'bold');
    doc.text(formatCurrency(paiement.montant || 0), 20, yPos + 23);
    
    const card2X = 15 + cardWidth + 5;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text("Déjà payé", card2X + 5, yPos + 10);
    
    doc.setFontSize(13);
    doc.setTextColor(22, 163, 74);
    doc.setFont(undefined, 'bold');
    doc.text(formatCurrency(paiement.totalPaye || 0), card2X + 5, yPos + 23);
    
    const card3X = card2X + cardWidth + 5;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text("Reste à payer", card3X + 5, yPos + 10);
    
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.setFont(undefined, 'bold');
    doc.text(formatCurrency(paiement.montantRestant || 0), card3X + 5, yPos + 23);

    yPos += 50;
    
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.setFont(undefined, 'bold');
    doc.text("Détails du paiement", 15, yPos);
    
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Description", "Montant"]],
      body: [
        ["Salaire brut période", formatCurrency(paiement.montant || 0)],
        ["Montant déjà payé", formatCurrency(paiement.totalPaye || 0)],
        ["Montant restant", formatCurrency(paiement.montantRestant || 0)],
      ],
      theme: 'striped',
      styles: { 
        fontSize: 11, 
        cellPadding: 8,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 12
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'normal' },
        1: { 
          halign: 'right', 
          fontStyle: 'bold',
          fontSize: 12
        }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.row.index === 2) {
          if (data.column.index === 1) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 0) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 20;
    
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.setFont(undefined, 'bold');
    doc.text("Statut du paiement:", 15, yPos);
    
    const statutLabel = getStatutLabel(paiement.statut);
    let bgColor, textColor, borderColor;
    
    switch(paiement.statut) {
      case 'PAYE':
        bgColor = [220, 252, 231];
        textColor = [22, 101, 52];
        borderColor = [187, 247, 208];
        break;
      case 'PARTIEL':
        bgColor = [254, 243, 199];
        textColor = [154, 52, 18];
        borderColor = [253, 224, 71];
        break;
      case 'EN_ATTENTE':
        bgColor = [254, 249, 195];
        textColor = [161, 98, 7];
        borderColor = [253, 224, 71];
        break;
      default:
        bgColor = [243, 244, 246];
        textColor = [31, 41, 55];
        borderColor = [209, 213, 219];
    }
    
    const badgeX = 70;
    const badgeWidth = 35;
    const badgeHeight = 10;
    
    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(badgeX, yPos - 7, badgeWidth, badgeHeight, 2, 2, 'FD');
    
    doc.setTextColor(...textColor);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text(statutLabel, badgeX + (badgeWidth / 2), yPos - 0.5, { align: 'center' });

    const footerY = pageHeight - 20;
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    const monthYear = payrun.dateDebut.toISOString().slice(0, 7);
    doc.save(`fiche_paie_${employe.matricule}_${monthYear}.pdf`);

  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    alert("Impossible de générer le PDF. Erreur: " + error.message);
  }
};


const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};
  const fetchPaiements = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeId = Number(localStorage.getItem('userId'));
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:4004/paiement/payslips?caisseId=${employeId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data); 
        setPaiements(data.data || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiques = async () => {
    try {
      const response = await ApiPaiement.getStatistiques(selectedMonth); 
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  useEffect(() => {
    fetchPaiements();
    fetchStatistiques();
  }, [selectedMonth]);

  
  const filteredPaiements = paiements.filter(p => {
    if (!p) return false;

    const employe = getEmployeInfo(p);
    const matchesSearch = (
      employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const payrun = getPayrunInfo(p);
    const paiementMonth = payrun.dateDebut ? new Date(payrun.dateDebut).toISOString().slice(0, 7) : null;
    const matchesMonth = !selectedMonth || paiementMonth === selectedMonth;

    const matchesStatut = filterStatut === 'tous' || p.statut === filterStatut;

    return matchesSearch && matchesMonth && matchesStatut;
  });

  const handleEffectuerPaiement = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayslip(null);
  };

  const handlePaiementSuccess = () => {
    fetchPaiements();
    fetchStatistiques();
    handleCloseModal();
  };



  return (

    
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.paiementsEnAttente}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Effectués</p>
              <p className="text-2xl font-bold text-green-600">{stats.paiementsEffectues}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.montantTotal)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Déjà payé</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(stats.montantPayé)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Paiements des salaires</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchPaiements}
                disabled={loading}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={generatePDF}
                disabled={filteredPaiements.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter PDF</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <select 
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PARTIEL">Partiel</option>
              <option value="PAYE">Payé</option>
            </select>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm"><strong>Erreur:</strong> {error}</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <RefreshCw className="animate-spin w-6 h-6 text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : filteredPaiements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 text-sm">
                    {searchTerm ? 
                      `Aucun paiement trouvé pour "${searchTerm}".` :
                      'Aucun paiement disponible pour cette période.'
                    }
                  </td>
                </tr>
              ) : (
                filteredPaiements.map((paiement) => {
                   const employe = getEmployeInfo(paiement);
                   const payrun = getPayrunInfo(paiement);
                  
                  return (
                    <tr  key={paiement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employe.prenom} {employe.nom}
                            </div>
                            <div className="text-xs text-gray-500">{employe.matricule}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(payrun.dateDebut)} - {formatDate(payrun.dateFin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(paiement.montant || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(paiement.totalPaye || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(paiement.montantRestant || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(paiement.statut)}`}>
                          {getStatutIcon(paiement.statut)}
                          {getStatutLabel(paiement.statut)}
                        </span>
                      </td>
                      {/* Ligne d'actions avec espacement */}
                      <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end space-x-2">
                        {(paiement.montantRestant || 0) > 0 ? (
                          <button
                            onClick={() => handleEffectuerPaiement(paiement)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Effectuer paiement
                          </button>
                        ) : (
                          <span className="text-sm text-green-600 font-medium mr-4">✓ Payé</span>
                        )}
                          <button
                            onClick={() => generatePDF(paiement)}
                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="Télécharger PDF"
                          >
                            <FileDown size={18} className="text-blue-600" />
                          </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedPayslip && (
        <ModalPaiement
          isOpen={showModal}
          onClose={handleCloseModal}
          payslip={selectedPayslip}
          onSuccess={handlePaiementSuccess}
        />
      )}
    </div>

  );
}