import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp, Download } from 'lucide-react';

const EmployePage = () => {
  const [pointages, setPointages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const employeId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    fetchPointages();
    fetchStatistiques();
    fetchQRCode();
  }, [selectedMonth]);

  const fetchPointages = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      const [year, month] = selectedMonth.split('-');
      const dateDebut = new Date(parseInt(year), parseInt(month) - 1, 1);
      const dateFin = new Date(parseInt(year), parseInt(month), 0);
      
      const response = await fetch(
        `http://localhost:4004/pointage/employe/${employeId}?dateDebut=${dateDebut.toISOString()}&dateFin=${dateFin.toISOString()}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      
      const data = await response.json();
      setPointages(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiques = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:4004/pointage/statistiques?employeId=${employeId}&mois=${selectedMonth}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchQRCode = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:4004/pointage/qrcode/${employeId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setQrCodeImage(data.data.qrCodeImage);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'RETARD':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return <CheckCircle className="w-5 h-5" />;
      case 'RETARD':
        return <Clock className="w-5 h-5" />;
      case 'ABSENT':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'PRESENT': return 'Présent';
      case 'RETARD': return 'En retard';
      case 'ABSENT': return 'Absent';
      default: return 'Inconnu';
    }
  };

  const telechargerQRCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrCodeImage;
      link.download = 'mon_qrcode_pointage.png';
      link.click();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Pointages
          </h1>
          <p className="text-gray-600">
            Consultez votre historique de présence et vos statistiques
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Mon QR Code de Pointage</h3>
              <p className="text-blue-100 mb-4">
                Présentez ce code au vigile chaque matin pour pointer
              </p>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Voir mon QR Code
              </button>
            </div>
            {qrCodeImage && (
              <div className="bg-white p-4 rounded-xl">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">jours pointés</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-800">Présences</p>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.presents}</p>
              <p className="text-xs text-green-600 mt-1">{stats.tauxPresence}% du temps</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-orange-800">Retards</p>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{stats.retards}</p>
              <p className="text-xs text-orange-600 mt-1">{stats.tauxRetard}% du temps</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-800">Assiduité</p>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.tauxPresence}%</p>
              <p className="text-xs text-blue-600 mt-1">taux de présence</p>
            </div>
          </div>
        )}

        {/* Historique */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Historique des pointages
              </h2>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : pointages.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun pointage pour cette période</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pointages.map(pointage => (
                  <div
                    key={pointage.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getStatutColor(pointage.statut).replace('text-', 'bg-').replace('100', '200')}`}>
                        {getStatutIcon(pointage.statut)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(pointage.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Arrivée: {formatTime(pointage.heureArrivee)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatutColor(pointage.statut)}`}>
                      {getStatutIcon(pointage.statut)}
                      {getStatutLabel(pointage.statut)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && qrCodeImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Mon QR Code de Pointage
            </h3>

            <div className="flex justify-center mb-6">
              <img 
                src={qrCodeImage} 
                alt="QR Code" 
                className="border-4 border-blue-600 rounded-lg"
                style={{ width: '300px', height: '300px' }}
              />
            </div>

            <p className="text-center text-gray-600 mb-6">
              Présentez ce code au vigile chaque matin pour enregistrer votre présence
            </p>

            <div className="flex space-x-3">
              <button
                onClick={telechargerQRCode}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployePage;