import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../api';
import PublicVerification from './PublicVerification';

export default function PublicVerificationPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.logApp('PublicVerificationPage monté avec le token URL', token);

    if (!token) {
      setError('Jeton de vérification manquant.');
      setLoading(false);
      return;
    }

    const fetchPublicData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestUrl = `${API_BASE}/api/public/verification/${encodeURIComponent(token)}`;
        window.logApp('PublicVerificationPage appel vers URL publique', requestUrl);

        const res = await fetch(requestUrl);
        window.logApp('PublicVerificationPage réponse statut', res.status);

        const json = await res.json();
        window.logApp('PublicVerificationPage JSON reçu', json);

        if (!res.ok || json.error) {
          const errorMsg = json.message || json.error || 'Véhicule introuvable dans le registre SPA RDC.';
          setError(errorMsg);
          setData(null);
        } else {
          setData(json);
        }
      } catch (err) {
        window.logApp('PublicVerificationPage exception', err.message);
        setError('Impossible de contacter le serveur SPA RDC. Détails: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [token]);

  return (
    <PublicVerification 
      token={token} 
      data={data} 
      loading={loading} 
      error={error} 
    />
  );
}
