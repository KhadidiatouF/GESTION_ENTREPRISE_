import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, Clock, AlertTriangle, User } from 'lucide-react';
import jsQR from 'jsqr';
import Header from '../../layout/header';
import Sidebar from '../../layout/sidebar';

export default function VigileScanner({ adminLinks, notifications }) {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [stats, setStats] = useState({
    presents: 0,
    retards: 0,
    absents: 0,
    total: 0
  });

  const vigileId = Number(localStorage.getItem('userId'));
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // --- Fonctions de Fetch ---

  const fetchRecentScans = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(
        'http://localhost:4004/pointage/aujourd-hui',
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();
        const scans = data.data?.pointages || [];
        setRecentScans(scans);

        const statsData = data.data?.stats;
        if (statsData) {
          setStats({
            presents: statsData.presents || 0,
            retards: statsData.retards || 0,
            absents: statsData.absents || 0,
            total: statsData.total || 0
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des scans:', error);
    }
  };

  useEffect(() => {
    fetchRecentScans();
    const interval = setInterval(fetchRecentScans, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Gestion de la caméra ---

  const startCamera = async () => {
    try {
      setShowCamera(true);

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            console.log('Caméra démarrée');
            setTimeout(() => {
              scanQRCodeFromVideo();
            }, 500);
          }).catch(err => {
            console.error('Erreur play:', err);
          });
        };
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setShowCamera(false);

      if (err.name === 'NotAllowedError') {
        alert('Permission caméra refusée. Autorisez l\'accès dans les paramètres.');
      } else if (err.name === 'NotFoundError') {
        alert('Aucune caméra trouvée sur cet appareil.');
      } else {
        alert(`Erreur caméra: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const scanQRCodeFromVideo = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!showCamera || !canvas || !video) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        console.log('QR Code détecté:', code.data);
        setQrInput(code.data);
        stopCamera();
        setTimeout(() => handleScan({ preventDefault: () => {} }), 100);
        return;
      }
    }

    requestAnimationFrame(scanQRCodeFromVideo);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // --- Gestion du Scan ---

  const handleScan = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setScanning(true);
    setResult(null);
    const currentInput = qrInput;

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4004/pointage/marquer-presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          matricule: currentInput,
          scanneParId: vigileId
        })
      });

      const data = await response.json();
      console.log('Réponse du scan:', data);
      
      setQrInput('');

      if (response.ok) {
        const newScan = data.data;
        setRecentScans(prev => [newScan, ...prev.filter(s => s.employe.matricule !== newScan.employe.matricule)]);
        
        // Mettre à jour les stats en fonction du statut (PRESENT, RETARD ou ABSENT)
        setStats(prev => ({
          ...prev,
          presents: prev.presents + (newScan.statut === 'PRESENT' ? 1 : 0),
          retards: prev.retards + (newScan.statut === 'RETARD' ? 1 : 0),
          absents: prev.absents + (newScan.statut === 'ABSENT' ? 1 : 0),
          total: prev.total + 1
        }));
        
        setResult({ 
          success: true, 
          message: data.message, 
          ...newScan
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Erreur lors du scan'
        });
        if (data.data) {
          setResult(prev => ({
            ...prev,
            ...data.data
          }));
        }
      }
    } catch (err) {
      console.error('Erreur handleScan:', err);
      setResult({
        success: false,
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setScanning(false);
      setTimeout(() => setResult(null), 5000);
    }
  };

  // --- Fonctions utilitaires avec support ABSENT ---

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'RETARD':
        return 'bg-orange-100 text-orange-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return 'À l\'heure';
      case 'RETARD':
        return 'En retard';
      case 'ABSENT':
        return 'Absent';
      default:
        return statut;
    }
  };

  const getStatutTextColor = (statut) => {
    switch(statut) {
      case 'PRESENT':
        return 'text-green-600';
      case 'RETARD':
        return 'text-orange-600';
      case 'ABSENT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // --- Rendu du Composant ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header notifications={notifications || 0} />

        <div className="flex flex-1">
            <Sidebar links={adminLinks} />

            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <QrCode className="w-8 h-8 mr-3 text-green-600" />
                        Scanner QR Code
                      </h1>
                      <p className="text-gray-600 mt-2">
                        Scannez les codes QR des employés pour enregistrer leur présence
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Aujourd'hui</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Employés</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">À l'heure</p>
                        <p className="text-3xl font-bold text-green-600">{stats.presents}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">En retard</p>
                        <p className="text-3xl font-bold text-orange-600">{stats.retards}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Absents</p>
                        <p className="text-3xl font-bold text-red-600">{stats.absents}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone de scan */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg border-2 border-green-300 p-8 mb-6">
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <QrCode className="w-12 h-12 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Scanner un QR Code</h2>
                      <p className="text-sm text-red-600 font-semibold mt-2">
                        Après 13h : le scan marquera l'employé comme ABSENT
                      </p>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Entrez le code ou scannez..."
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={scanning}
                        autoFocus
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={startCamera}
                          disabled={scanning || showCamera}
                          className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <QrCode className="w-5 h-5" />
                          <span>Scanner</span>
                        </button>

                        <button
                          onClick={handleScan}
                          disabled={scanning || !qrInput.trim()}
                          className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {scanning ? 'Vérification...' : 'Valider'}
                        </button>
                      </div>
                    </div>

                 {showCamera && (
                    <div className="mt-6 relative">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-cover"
                        />
                        
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-lg shadow-lg">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                          </div>
                        </div>
                        
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      
                      <button
                        onClick={stopCamera}
                        className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        Fermer la caméra
                      </button>
                      
                      <p className="text-center text-sm text-gray-600 mt-2">
                        Positionnez le QR code dans le cadre vert
                      </p>
                    </div>
                  )}

                  {result && (
                      <div className={`mt-6 p-4 rounded-lg ${
                        result.success 
                          ? result.statut === 'ABSENT' 
                            ? 'bg-red-100 border-2 border-red-300'
                            : 'bg-green-100 border-2 border-green-300'
                          : 'bg-red-100 border-2 border-red-300'
                      }`}>
                        <div className="flex items-start">
                          {result.success ? (
                            result.statut === 'ABSENT' ? (
                              <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                            ) : (
                              <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                            )
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              result.success 
                                ? result.statut === 'ABSENT' 
                                  ? 'text-red-800' 
                                  : 'text-green-800'
                                : 'text-red-800'
                            }`}>
                              {result.message}
                            </p>
                            {result.employe && (
                              <div className="mt-2 text-sm text-gray-700">
                                <p><strong>Nom / Prénom :</strong> {result.employe.prenom} {result.employe.nom}</p>
                                <p><strong>Matricule :</strong> {result.employe.matricule}</p>
                                <p><strong>Type de contrat :</strong> {result.employe.typeContrat || 'N/A'}</p>
                                <p><strong>Heure :</strong> {formatTime(result.heureArrivee)}</p>
                                <p><strong>Statut :</strong> 
                                  <span className={`font-semibold ml-1 ${getStatutTextColor(result.statut)}`}>
                                    {getStatutLabel(result.statut)}
                                  </span>
                                </p>
                                {result.statut === 'ABSENT' && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-700 text-xs font-medium">
                                      Scan effectué après 13h - Marqué comme ABSENT
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Pointages d'aujourd'hui (10 derniers)</h3>
                  </div>
                  <div className="p-6">
                    {recentScans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun pointage pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentScans.slice(0, 10).map((scan) => (
                          <div
                            key={scan.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {scan.employe.prenom} {scan.employe.nom}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {scan.employe.matricule}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatTime(scan.heureArrivee)}
                              </p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(scan.statut)}`}>
                                {getStatutLabel(scan.statut)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
        </div>
    </div>
  );
}