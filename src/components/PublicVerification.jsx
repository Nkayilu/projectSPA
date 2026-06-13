import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, Clock, AlertTriangle, User,
  Calendar, FileText, MapPin, Download, Car, Hash,
  Palette, Layers, CheckCircle2, XCircle, AlertCircle,
  BadgeCheck, Building2, RefreshCw, Printer, FileDown
} from 'lucide-react';
import { API_BASE } from '../api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch { return dateStr; }
};

const getDocLabel = (type) => {
  const labels = {
    carteRose: 'Carte Rose RDC',
    insurance: 'Assurance SONAS',
    vignette: 'Vignette Fiscale',
    controleTechnique: 'Contrôle Technique',
  };
  return labels[type] || type;
};

const getDocStatusInfo = (status) => {
  switch (status) {
    case 'Valide':
      return { icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)', label: 'Valide' };
    case 'Expire bientôt':
      return { icon: AlertCircle, color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', label: 'Expire bientôt' };
    case 'Expiré':
      return { icon: XCircle, color: '#CE102E', bg: 'rgba(206,16,46,0.08)', border: 'rgba(206,16,46,0.2)', label: 'Expiré' };
    default:
      return { icon: FileText, color: '#64748B', bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.15)', label: status || 'N/A' };
  }
};

// ─── Doc Card ────────────────────────────────────────────────────────────────

function DocCard({ doc }) {
  const info = getDocStatusInfo(doc.status);
  const Icon = info.icon;
  return (
    <div style={{
      background: info.bg,
      border: `1px solid ${info.border}`,
      borderRadius: '12px',
      padding: '0.85rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-main)' }}>
          {getDocLabel(doc.doc_type)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
          color: info.color, background: info.bg, border: `1px solid ${info.border}`,
          borderRadius: '20px', padding: '0.15rem 0.5rem',
        }}>
          <Icon size={9} /> {info.label}
        </span>
      </div>
      {doc.doc_number && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Hash size={10} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
          <code style={{ fontSize: '0.73rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
            {doc.doc_number}
          </code>
        </div>
      )}
      {(doc.valid_from || doc.valid_until) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={10} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
            {formatDateShort(doc.valid_from)} → {formatDateShort(doc.valid_until)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon, highlight, mono }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      padding: '0.65rem 0.85rem',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--color-text-light)',
        display: 'flex', alignItems: 'center', gap: '0.25rem',
      }}>
        {Icon && <Icon size={9} />}
        {label}
      </span>
      <span style={{
        fontWeight: 700,
        fontSize: mono ? '0.8rem' : '0.92rem',
        color: highlight || 'var(--color-text-main)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        letterSpacing: mono ? '0.05em' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Status Banner ─────────────────────────────────────────────────────────────

function StatusBanner({ status }) {
  if (status === 'authentic') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #064E3B, #065F46)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: '2px solid rgba(16,185,129,0.4)',
        }}>
          <ShieldCheck size={26} color="#10B981" />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(16,185,129,0.8)', marginBottom: '0.2rem' }}>
            Vérification SPA RDC — Certifié
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>
            ✅ Véhicule Certifié Authentique
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
            Vérifié et validé par l'autorité compétente
          </div>
        </div>
      </div>
    );
  }
  if (status === 'suspicious') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #7F1D1D, #991B1B)',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1.5rem',
        animation: 'blinkAlert 2s infinite',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: '2px solid rgba(239,68,68,0.5)',
        }}>
          <ShieldAlert size={26} color="#EF4444" />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(239,68,68,0.9)', marginBottom: '0.2rem' }}>
            ⚠️ ALERTE SÉCURITÉ NATIONALE
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCA5A5' }}>
            🚨 Véhicule Signalé — SUSPECT / VOLÉ
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
            Signalement actif auprès de la Police Nationale Congolaise (PNC)
          </div>
        </div>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #451A03, #78350F)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: '2px solid rgba(245,158,11,0.4)',
        }}>
          <Clock size={26} color="#F59E0B" />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,158,11,0.8)', marginBottom: '0.2rem' }}>
            Dossier en Cours de Validation
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCD34D' }}>
            ⏳ En Attente de Gravage / Validation
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Main PublicVerification ─────────────────────────────────────────────────

export default function PublicVerification({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultationTime, setConsultationTime] = useState('');

  useEffect(() => {
    setConsultationTime(new Date().toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }));

    window.logApp('PublicVerification monté avec le token', token);
    if (!token) {
      window.logApp('Erreur PublicVerification: aucun token fourni');
      setError('Jeton de vérification manquant.');
      setLoading(false);
      return;
    }
    fetchVehicle(token);
  }, [token]);

  const fetchVehicle = async (tok) => {
    window.logApp('fetchVehicle démarré pour le token', tok);
    setLoading(true);
    setError(null);
    try {
      // Essayer d'abord avec le token de session (si connecté)
      const headers = { 'Content-Type': 'application/json' };
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u.token) {
            headers['Authorization'] = `Bearer ${u.token}`;
            window.logApp('Jeton d\'authentification trouvé', u.username);
          }
        } catch (e) {
          window.logApp('Erreur de lecture de savedUser', e.message);
        }
      }

      const requestUrl = `${API_BASE}/api/verify/qr/${encodeURIComponent(tok)}`;
      window.logApp('Appel fetch vers URL', requestUrl);
      
      const res = await fetch(requestUrl, { headers });
      window.logApp('Fetch complété. Statut HTTP: ' + res.status);
      
      const json = await res.json();
      window.logApp('JSON parsé reçu du backend', json);

      if (!res.ok || json.error) {
        const errorMsg = json.message || json.error || 'Véhicule introuvable dans le registre SPA RDC.';
        window.logApp('Le backend a retourné une erreur', errorMsg);
        setError(errorMsg);
        setData(null);
      } else {
        window.logApp('Données véhicule chargées', { plate: json.plate_number, status: json.vehicle_status });
        setData(json);
      }
    } catch (err) {
      window.logApp('Exception attrapée dans fetchVehicle', err.message);
      setError('Impossible de contacter le serveur SPA RDC. Détails: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!data?.qr_image_data) return;
    const a = document.createElement('a');
    a.href = data.qr_image_data;
    a.download = `QR-SPA-${data.plate_number || 'inconnu'}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-base)', padding: '2rem',
      }}>
        <div className="spinner-loader" style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '4px solid rgba(0,135,209,0.2)',
          borderTopColor: 'var(--color-sky-blue)',
          animation: 'scannerMotion 0.8s linear infinite',
          marginBottom: '1.5rem',
        }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
          Interrogation du Registre National SPA RDC...
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
          Vérification du token QR : <code style={{ color: 'var(--color-sky-blue)' }}>{token}</code>
        </div>
      </div>
    );
  }

  // ── Error / Not Found ──
  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg-base)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <PublicHeader />
          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginTop: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(206,16,46,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', border: '2px solid rgba(206,16,46,0.2)'
            }}>
              <XCircle size={36} color="var(--color-crimson)" />
            </div>
            <h1 style={{ color: 'var(--color-text-main)', marginBottom: '0.2rem', fontSize: '1.6rem', fontWeight: 800 }}>
              CERTIFICAT NON VALIDE
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 700 }}>
              Registre National du Véhicule RDC
            </p>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Le QR Code scanné ne correspond à aucun véhicule enregistré dans le système SPA RDC.
            </p>
            <div style={{
              background: 'rgba(15,23,42,0.02)', borderRadius: '12px',
              padding: '1.25rem', border: '1px dashed rgba(148,163,184,0.3)',
              textAlign: 'left', marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontWeight: 600, display: 'flex', gap: '0.4rem', alignItems: 'flex-start', lineHeight: 1.5 }}>
                <span>⚠️</span>
                <span>Attention : Si vous tentez d'acheter ou d'inspecter une pièce dont le gravage laser officiel est absent, altéré ou non enregistré, celle-ci peut provenir d'un véhicule volé.</span>
              </p>
              <div style={{ marginTop: '0.85rem', borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Jeton recherché :</span>
                <code style={{ fontSize: '0.7rem', color: 'var(--color-crimson)', wordBreak: 'break-all', fontWeight: 700 }}>{token}</code>
              </div>
            </div>
            <button
              onClick={() => fetchVehicle(token)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--color-sky-blue) 0%, #005A9C 100%)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 750,
                boxShadow: '0 4px 12px rgba(0,135,209,0.3)', width: '100%', justifyContent: 'center'
              }}
            >
              <RefreshCw size={14} /> Réinterroger le registre
            </button>
          </div>
          <PublicFooter />
        </div>
      </div>
    );
  }

  // ── Result ──
  const isPrivileged = data.access_level === 'PRIVILEGED_ACCESS_OFFICIAL';
  const owner = data.owner || {};

  // Calcul d'une date de fin de validité (5 ans après la date d'enregistrement officielle)
  const calculateValidity = (regDateStr) => {
    if (!regDateStr) return 'Permanent';
    try {
      const regDate = new Date(regDateStr);
      const valDate = new Date(regDate.setFullYear(regDate.getFullYear() + 5));
      return valDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '5 ans à compter du gravage';
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1.5rem 1rem 3rem',
    }}>
      {/* Dynamic CSS styles loaded specifically for this component to control premium print look */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, button, header, footer, .toast-container, .national-stripe {
            display: none !important;
          }
          .print-card-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 4px double #0A1428 !important;
            border-radius: 0 !important;
            padding: 20px !important;
            margin: 0 !important;
          }
          .print-badge-badge {
            border: 1px solid #000000 !important;
            color: #000000 !important;
            background: none !important;
          }
          .print-section-divider {
            border-bottom: 1px solid #CBD5E1 !important;
          }
          .print-signature-box {
            display: flex !important;
          }
          .print-bg-adjust {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        <PublicHeader />

        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-800))',
              border: '1px solid var(--color-navy-600)', color: '#fff', borderRadius: '10px',
              padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <Printer size={14} /> Imprimer le Certificat
          </button>
          <button
            onClick={handlePrint} // open native print which handles print to PDF perfectly
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              background: 'linear-gradient(135deg, var(--color-sky-blue), #0070B8)',
              border: '1px solid var(--color-sky-blue)', color: '#fff', borderRadius: '10px',
              padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0,135,209,0.2)'
            }}
          >
            <FileDown size={14} /> Télécharger PDF
          </button>
        </div>

        {/* Status Banner */}
        <StatusBanner status={data.vehicle_status} />

        {/* Main Certificate Card */}
        <div className="print-card-wrapper" style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
          marginBottom: '1rem',
          position: 'relative'
        }}>
          {/* Official Document watermark decoration */}
          <div style={{
            position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontFamily: 'var(--font-display)', fontSize: '5.5rem', fontWeight: 900,
            color: 'rgba(0,135,209,0.015)', pointerEvents: 'none', userSelect: 'none', zIndex: 0
          }}>
            OFFICIEL RDC
          </div>

          {/* Certificate Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
            padding: '1.5rem',
            borderBottom: '3px solid var(--color-sky-blue)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.2rem' }}>🦁</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              CERTIFICAT SPA
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-sky-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, margin: '0.2rem 0 0' }}>
              Registre National du Véhicule
            </p>
            <div style={{ height: '2px', background: 'var(--flag-gradient)', width: '60px', margin: '0.6rem auto 0' }} />
          </div>

          {/* Vehicle Identification */}
          <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
            <SectionTitle icon={Car} label="Identification du Véhicule" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="① Plaque d'immatriculation" value={data.plate_number} highlight="var(--color-sky-blue)" icon={Hash} />
              <InfoRow label="② Châssis / VIN" value={data.vin} mono icon={Hash} />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
            <SectionTitle icon={Layers} label="Caractéristiques Techniques" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="③ Marque" value={data.brand} />
              <InfoRow label="④ Modèle" value={data.model} />
              <InfoRow label="⑤ Couleur" value={data.color} icon={Palette} />
              <InfoRow label="⑥ Catégorie" value={data.vehicle_type} />
              <InfoRow label="Année de fabrication" value={data.year_manufactured} />
            </div>
          </div>

          {/* Owner details */}
          <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
            <SectionTitle icon={User} label="Propriétaire Enregistré" />
            <div className="print-bg-adjust" style={{
              background: 'rgba(15,23,42,0.02)',
              border: '1px solid var(--color-border-light)',
              borderRadius: '12px', padding: '1rem',
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Nom complet : {owner.full_name || owner.name || '—'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
                <div>📞 Tél : {owner.phone || '—'}</div>
                <div>📧 Email : {owner.email || '—'}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.5rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <MapPin size={11} style={{ flexShrink: 0 }} /> Adresse : {owner.address || '—'}
              </div>
            </div>
          </div>

          {/* Center Details */}
          <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
            <SectionTitle icon={Building2} label="Centre d'Enregistrement Officiel" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="Station / Agent Émetteur" value={data.center_name} icon={Building2} />
              <InfoRow label="Province / Région" value={data.center_region || 'Kinshasa'} icon={MapPin} />
              <InfoRow label="Date de Gravage" value={formatDate(data.registered_at)} icon={Calendar} />
              <InfoRow label="Date de Validité" value={calculateValidity(data.registered_at)} highlight="var(--color-authentic)" icon={ShieldCheck} />
            </div>
          </div>

          {/* LASER Marked Parts List */}
          {data.parts && data.parts.length > 0 && (
            <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
              <SectionTitle icon={Hash} label={`Liste des Pièces Gravées Laser (${data.parts.length})`} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {data.parts.map((p, i) => (
                  <div key={i} className="print-bg-adjust" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(0,135,209,0.03)', border: '1px solid rgba(0,135,209,0.08)',
                    borderRadius: '10px', padding: '0.5rem 0.75rem',
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{p.name}</span>
                    <code style={{ fontSize: '0.72rem', color: 'var(--color-sky-blue)', fontWeight: 800 }}>{p.id}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin documents */}
          {data.documents && data.documents.length > 0 && (
            <div className="print-section-divider" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
              <SectionTitle icon={FileText} label="Documents Administratifs & Statuts" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.documents.map((doc, i) => <DocCard key={i} doc={doc} />)}
              </div>
            </div>
          )}

          {/* Security Alert PNC (if suspicious) */}
          {data.vehicle_status === 'suspicious' && data.stolenReport && (
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(206,16,46,0.03)', borderBottom: '1px solid var(--color-border-light)', position: 'relative', zIndex: 1 }}>
              <SectionTitle icon={ShieldAlert} label="Détails du Signalement PNC" color="var(--color-crimson)" />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                <div><strong>Référence Incident :</strong> {data.stolenReport.incidentId}</div>
                <div><strong>Lieu de Déclaration :</strong> {data.stolenReport.location}</div>
                <div><strong>Statut d'Interception :</strong> {data.stolenReport.status}</div>
              </div>
            </div>
          )}

          {/* Cryptographic verification info & QR Code */}
          <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(15,23,42,0.01)', position: 'relative', zIndex: 1 }}>
            <SectionTitle icon={BadgeCheck} label="Informations de Vérification & Signature" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {data.qr_image_data && (
                <div style={{
                  background: '#fff', padding: '6px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', flexShrink: 0,
                }}>
                  <img src={data.qr_image_data} alt="QR SPA" style={{ width: '80px', height: '80px', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
                  <strong>Jeton QR :</strong> <code style={{ fontSize: '0.65rem', color: 'var(--color-sky-blue)' }}>{data.secure_token || token}</code>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', marginTop: '0.2rem' }}>
                  <strong>Consulté le :</strong> {consultationTime}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.4rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                  « Cette information provient du Registre National SPA RDC. Certificat officiel protégé par chiffrement cryptographique. »
                </p>
                <div className="no-print" style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={downloadQR}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      background: 'var(--color-navy-700)', border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text-main)', borderRadius: '6px',
                      padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700
                    }}
                  >
                    <Download size={11} /> Code QR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Official Signatures and Stamps for PDF/Print view only */}
          <div className="print-signature-box" style={{
            display: 'none',
            justifyContent: 'space-between',
            borderTop: '1px dashed #A3B1C2',
            margin: '2rem 1.5rem 1.5rem',
            paddingTop: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Sceau de l'État</span>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                border: '2px dashed #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.55rem', color: '#94A3B8', fontWeight: 700, margin: '0.2rem 0 0'
              }}>
                SPA RDC
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-main)', textTransform: 'uppercase', display: 'block', marginBottom: '2.5rem' }}>Signataire National</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', fontStyle: 'italic', borderTop: '1px solid #E2E8F0', paddingTop: '0.25rem' }}>Chiffré électroniquement</span>
            </div>
          </div>

        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.72rem', fontWeight: 850, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: color || 'var(--color-text-subtle)',
      marginBottom: '0.75rem',
    }}>
      {Icon && <Icon size={12} style={{ flexShrink: 0 }} />}
      {label}
    </div>
  );
}

function PublicHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '1rem 0', marginBottom: '1.25rem',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-800))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
        border: '1px solid var(--color-border-light)',
      }}>
        🦁
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-sky-blue)' }}>
          SPA RDC
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', fontWeight: 700 }}>
          Sécurité Pièces Auto — Registre National
        </div>
        <div style={{ fontSize: '0.58rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          République Démocratique du Congo
        </div>
      </div>
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
          background: 'rgba(5,150,105,0.08)', color: 'var(--color-authentic)',
          border: '1px solid rgba(5,150,105,0.2)', borderRadius: '20px',
          padding: '0.25rem 0.65rem', whiteSpace: 'nowrap'
        }}>
          <ShieldCheck size={9} /> Authentifié par SPA RDC
        </span>
      </div>
    </div>
  );
}

function PublicFooter() {
  return (
    <div style={{
      marginTop: '1.5rem', textAlign: 'center',
      fontSize: '0.68rem', color: 'var(--color-text-light)',
      lineHeight: 1.8,
    }}>
      <div>🔐 Document officiel généré par le Système de Protection Anti-Vol — SPA RDC</div>
      <div>Ce certificat est infalsifiable et protégé par signature cryptographique.</div>
      <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>
        © 2026 SPA RDC – Smart Parts Authentication · Ministère de l'Intérieur RDC
      </div>
    </div>
  );
}
