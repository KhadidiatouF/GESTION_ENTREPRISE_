import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw, QrCode } from 'lucide-react';
import { apiEmploye } from "../api/apiEmploy";

export default function QRCodeDisplay({ isOpen, onClose, employe }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && employe) {
      loadQRCode();
    }
  }, [isOpen, employe]);

  const loadQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiEmploye.getQRCode(employe.id);
      setQrCode(response.data.qrCode);
    } catch  {
      setError('Impossible de charger le QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiEmploye.regenerateQRCode(employe.id);
      setQrCode(response.data.qrCode);
    } catch {
      setError('Impossible de régénérer le QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QR_${employe.matricule}_${employe.prenom}_${employe.nom}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !employe) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">QR Code de Pointage</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {employe.prenom} {employe.nom}
                </p>
                <p className="text-sm text-gray-600">Mat: {employe.matricule}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <p>Fonction: {employe.fonction || 'Non spécifiée'}</p>
              <p>Type: {employe.typeContrat}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement du QR Code...</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 w-full">
                <p className="text-xs text-yellow-800 text-center">
                  Ce QR Code doit être scanné par le vigile pour marquer la présence
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Régénérer
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}