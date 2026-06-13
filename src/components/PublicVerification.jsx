import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, Clock, AlertTriangle, User,
  Calendar, FileText, MapPin, Download, Car, Hash,
  Palette, Layers, CheckCircle2, XCircle, AlertCircle,
  BadgeCheck, Building2, RefreshCw, ExternalLink
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

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
            Vérification SPA RDC — Authentique
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>
            ✅ Véhicule Certifié Authentique
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
            Vérifié le {formatDate(new Date().toISOString())}
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
            🚨 Véhicule Signalé — VOLÉ / SUSPECT
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
            Signalement actif — Police Nationale Congolaise
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
            ⏳ Gravage en Attente de Confirmation
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

  useEffect(() => {
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
            window.logApp('Jeton d\'authentification trouvé et inclus dans l\'en-tête de requête', u.username);
          }
        } catch (e) {
          window.logApp('Erreur de lecture de savedUser dans fetchVehicle', e.message);
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
        window.logApp('Données véhicule chargées avec succès', { plate: json.plate_number, brand: json.brand, status: json.vehicle_status });
        setData(json);
      }
    } catch (err) {
      window.logApp('Exception attrapée dans fetchVehicle', err.message);
      setError('Impossible de contacter le serveur SPA RDC. Vérifiez votre connexion. Détails: ' + err.message);
    } finally {
      window.logApp('Fin de fetchVehicle. Chargement terminé.');
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

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-base)', padding: '2rem',
      }}>
        <div style={{
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
        {/* Header */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <PublicHeader />
          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '1.5rem',
          }}>
            <AlertTriangle size={52} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--color-text-main)', marginBottom: '0.75rem', fontSize: '1.3rem' }}>
              Véhicule Introuvable
            </h2>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {error || 'Ce QR Code ne correspond à aucun véhicule enregistré dans le registre national SPA RDC.'}
            </p>
            <div style={{
              marginTop: '1.5rem',
              background: 'rgba(248,250,252,0.05)', borderRadius: '12px',
              padding: '1rem', border: '1px dashed rgba(148,163,184,0.2)',
            }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginBottom: '0.5rem' }}>
                ⚠️ Si vous tentez d'acquérir une pièce dont le marquage est absent ou altéré, cette pièce peut provenir d'un véhicule volé.
              </p>
              <code style={{ fontSize: '0.7rem', color: '#64748B', wordBreak: 'break-all' }}>Token: {token}</code>
            </div>
            <button
              onClick={() => fetchVehicle(token)}
              style={{
                marginTop: '1.25rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--color-navy-700)', border: '1px solid var(--color-border-light)',
                color: 'var(--color-text-main)', borderRadius: '10px',
                padding: '0.65rem 1.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <RefreshCw size={14} /> Réessayer
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

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1.5rem 1rem 3rem',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <PublicHeader />

        {/* Status Banner */}
        <StatusBanner status={data.vehicle_status} />

        {/* Main Card */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '12px',
                background: 'rgba(0,135,209,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(0,135,209,0.25)',
              }}>
                <Car size={22} color="var(--color-sky-blue)" />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-sky-blue)', letterSpacing: '0.04em' }}>
                  {data.plate_number}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                  {data.brand} {data.model} · {data.year_manufactured}
                </div>
              </div>
            </div>
          </div>

          {/* Identification */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <SectionTitle icon={Car} label="Identification du Véhicule" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="① Immatriculation" value={data.plate_number} highlight="var(--color-sky-blue)" icon={Hash} />
              <InfoRow label="② Châssis / VIN" value={data.vin} mono icon={Hash} />
            </div>
          </div>

          {/* Caractéristiques */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <SectionTitle icon={Layers} label="Caractéristiques Techniques" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="③ Marque" value={data.brand} />
              <InfoRow label="④ Modèle" value={data.model} />
              <InfoRow label="⑤ Couleur" value={data.color} icon={Palette} />
              <InfoRow label="⑥ Catégorie" value={data.vehicle_type} />
            </div>
          </div>

          {/* Propriétaire */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <SectionTitle icon={User} label="⑦ Propriétaire Enregistré" />
            <div style={{
              background: data.vehicle_status === 'authentic'
                ? 'rgba(5,150,105,0.04)' : 'rgba(206,16,46,0.04)',
              border: `1px solid ${data.vehicle_status === 'authentic'
                ? 'rgba(5,150,105,0.15)' : 'rgba(206,16,46,0.15)'}`,
              borderRadius: '12px', padding: '1rem',
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                {owner.name || owner.full_name || '— Confidentiel —'}
              </div>
              {isPrivileged && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
                  📞 {owner.phone || '—'} · 📧 {owner.email || '—'}
                </div>
              )}
              {isPrivileged && owner.address && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.35rem', display: 'flex', gap: '0.35rem' }}>
                  <MapPin size={11} /> {owner.address}
                </div>
              )}
              {!isPrivileged && (
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  🔒 Identité protégée — Accès réservé aux agents SPA / PNC assermentés
                </div>
              )}
            </div>
          </div>

          {/* Enregistrement */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <SectionTitle icon={Building2} label="Enregistrement Officiel" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <InfoRow label="⑧ Station de Gravage" value={data.center_name || 'Centre Agréé SPA RDC'} icon={Building2} />
              <InfoRow label="⑨ Date d'Enregistrement" value={formatDate(data.registered_at)} icon={Calendar} />
            </div>
          </div>

          {/* Documents */}
          {data.documents && data.documents.length > 0 && (
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
              <SectionTitle icon={FileText} label="⑪⑫ Documents Administratifs" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.documents.map((doc, i) => <DocCard key={i} doc={doc} />)}
              </div>
            </div>
          )}

          {/* Pièces gravées */}
          {data.parts && data.parts.length > 0 && (
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
              <SectionTitle icon={Hash} label={`Pièces Gravées Laser (${data.parts.length})`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {data.parts.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(0,135,209,0.04)', border: '1px solid rgba(0,135,209,0.12)',
                    borderRadius: '10px', padding: '0.55rem 0.85rem',
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{p.name}</span>
                    <code style={{ fontSize: '0.75rem', color: 'var(--color-sky-blue)', fontWeight: 700 }}>{p.id}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rapport vol si suspect */}
          {data.vehicle_status === 'suspicious' && data.stolenReport && (
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(206,16,46,0.03)' }}>
              <SectionTitle icon={ShieldAlert} label="Détails du Signalement PNC" color="var(--color-crimson)" />
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', lineHeight: 1.7 }}>
                <div><strong>Réf. incident :</strong> {data.stolenReport.incidentId}</div>
                <div><strong>Date :</strong> {data.stolenReport.date}</div>
                <div><strong>Lieu :</strong> {data.stolenReport.location}</div>
                <div><strong>Statut :</strong> {data.stolenReport.status}</div>
              </div>
            </div>
          )}

          {/* QR Code */}
          {data.qr_image_data && (
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.01)' }}>
              <SectionTitle icon={BadgeCheck} label="⑬ Code QR de Vérification" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: '#fff', padding: '6px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', flexShrink: 0,
                }}>
                  <img src={data.qr_image_data} alt="QR SPA" style={{ width: '80px', height: '80px', display: 'block' }} />
                </div>
                <div style={{ flex: 1 }}>
                  {data.secure_token && (
                    <code style={{ fontSize: '0.62rem', color: 'var(--color-text-light)', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                      {data.secure_token}
                    </code>
                  )}
                  <button
                    onClick={downloadQR}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: 'var(--color-navy-700)', border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text-main)', borderRadius: '8px',
                      padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    }}
                  >
                    <Download size={12} /> Télécharger QR
                  </button>
                </div>
              </div>
            </div>
          )}
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
      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: color || 'var(--color-text-subtle)',
      marginBottom: '0.75rem',
    }}>
      {Icon && <Icon size={12} />}
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
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-sky-blue)' }}>
          SPA RDC
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
          Sécurité Pièces Auto — Registre National
        </div>
        <div style={{ fontSize: '0.58rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          République Démocratique du Congo
        </div>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
          background: 'rgba(5,150,105,0.1)', color: '#10B981',
          border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px',
          padding: '0.25rem 0.6rem',
        }}>
          <ShieldCheck size={9} /> Sécurisé
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
      <div>🔐 Document généré par le Système de Protection Anti-Vol — SPA RDC</div>
      <div>Ce certificat est infalsifiable et protégé par chiffrement cryptographique.</div>
      <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>
        © 2026 SPA RDC – Smart Parts Authentication · Ministère de l'Intérieur RDC
      </div>
    </div>
  );
}
