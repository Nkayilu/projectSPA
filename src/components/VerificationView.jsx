import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, QrCode, ShieldCheck, ShieldAlert, Clock, RefreshCw, Send, Printer,
  User, Calendar, FileText, MapPin, Download, AlertTriangle, X, Building2,
  Hash, Car, Palette, Layers, CheckCircle2, XCircle, AlertCircle, BadgeCheck
} from 'lucide-react';

const API_BASE = '';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Document Badge Card ─────────────────────────────────────────────────────

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
          color: info.color,
          background: info.bg, border: `1px solid ${info.border}`,
          borderRadius: '20px', padding: '0.15rem 0.5rem',
        }}>
          <Icon size={9} /> {info.label}
        </span>
      </div>
      {doc.doc_number && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Hash size={10} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
          <code style={{ fontSize: '0.73rem', color: 'var(--color-text-main)', fontWeight: 600, letterSpacing: '0.03em' }}>
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

// ─── Info Cell ───────────────────────────────────────────────────────────────

function InfoCell({ label, value, icon: Icon, highlight, mono }) {
  return (
    <div className="verify-info-block">
      <span className="verify-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {Icon && <Icon size={9} style={{ display: 'inline' }} />}
        {label}
      </span>
      <span style={{
        fontWeight: 700,
        fontSize: mono ? '0.8rem' : '0.95rem',
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

// ─── Authentic Certificate Card ───────────────────────────────────────────────

function AuthenticCertificate({ vehicle, onReset, onDownloadQR, onPrint }) {
  const owner = vehicle.owner || {};

  return (
    <div className="cert-card" style={{ animation: 'scaleInAlert 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>

      {/* ── Certificate Header ── */}
      <div className="cert-header">
        <div className="cert-watermark">SPA</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div className="cert-shield">
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.1rem' }}>
                République Démocratique du Congo
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Certificat SPA — Registre National
              </div>
            </div>
          </div>
          <div className="certificate-flag" style={{ marginBottom: '0.6rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-authentic" style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>
              <BadgeCheck size={12} /> Véhicule Certifié Authentique
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              Vérifié le {formatDate(new Date().toISOString())}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
          <button onClick={onPrint} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} title="Imprimer">
            <Printer size={14} /> Imprimer
          </button>
          {vehicle.qr_image_data && (
            <button onClick={onDownloadQR} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} title="Télécharger QR">
              <Download size={14} /> QR
            </button>
          )}
        </div>
      </div>

      {/* ── Certificate Body ── */}
      <div className="cert-body">

        {/* ①② Immatriculation + VIN */}
        <div className="cert-section">
          <h4 className="cert-section-title">
            <Car size={13} /> Identification du Véhicule
          </h4>
          <div className="cert-grid-2">
            <InfoCell label="① Immatriculation" value={vehicle.plate} highlight="var(--color-sky-blue)" icon={Hash} />
            <InfoCell label="② Châssis / VIN" value={vehicle.vin} mono icon={Hash} />
          </div>
        </div>

        {/* ③④⑤⑥ Marque / Modèle / Couleur / Type */}
        <div className="cert-section">
          <h4 className="cert-section-title">
            <Layers size={13} /> Caractéristiques Techniques
          </h4>
          <div className="cert-grid-4">
            <InfoCell label="③ Marque" value={vehicle.brand} />
            <InfoCell label="④ Modèle" value={vehicle.model} />
            <InfoCell label="⑤ Couleur" value={vehicle.color} icon={Palette} />
            <InfoCell label="⑥ Catégorie" value={vehicle.category} />
          </div>
        </div>

        {/* ⑦ Propriétaire */}
        <div className="cert-section">
          <h4 className="cert-section-title">
            <User size={13} /> Propriétaire Enregistré
          </h4>
          <div style={{
            background: 'rgba(5,150,105,0.04)',
            border: '1px solid rgba(5,150,105,0.15)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-authentic), #047857)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <User size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                  ⑦ {owner.name || owner.full_name || '— Confidentiel —'}
                </div>
                {vehicle.access_level === 'PRIVILEGED_ACCESS_OFFICIAL' && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '0.1rem' }}>
                    📞 {owner.phone || '—'} &nbsp;·&nbsp; 📧 {owner.email || '—'}
                  </div>
                )}
              </div>
            </div>
            {vehicle.access_level === 'PRIVILEGED_ACCESS_OFFICIAL' && owner.address && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid rgba(5,150,105,0.1)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                <MapPin size={11} /> {owner.address}
              </div>
            )}
            {vehicle.access_level !== 'PRIVILEGED_ACCESS_OFFICIAL' && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                🔒 Identité protégée — Accès réservé aux agents assermentés SPA / PNC
              </div>
            )}
          </div>
        </div>

        {/* ⑧⑨⑩ Station + Date + Statut */}
        <div className="cert-section">
          <h4 className="cert-section-title">
            <Building2 size={13} /> Enregistrement Officiel
          </h4>
          <div className="cert-grid-3">
            <InfoCell label="⑧ Station de Gravage" value={vehicle.center_name || 'Centre Agréé SPA RDC'} icon={Building2} />
            <InfoCell label="⑨ Date d'Enregistrement" value={formatDate(vehicle.registered_at)} icon={Calendar} />
            <div className="verify-info-block">
              <span className="verify-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={9} /> ⑩ Statut de Sécurité
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                fontWeight: 800, fontSize: '0.85rem',
                color: 'var(--color-authentic)',
              }}>
                <ShieldCheck size={14} /> Authentique &amp; Certifié
              </span>
            </div>
          </div>
        </div>

        {/* ⑪⑫ Documents */}
        {vehicle.documents && vehicle.documents.length > 0 && (
          <div className="cert-section">
            <h4 className="cert-section-title">
              <FileText size={13} /> ⑪⑫ Documents Administratifs &amp; Validité
            </h4>
            <div className="cert-docs-grid">
              {vehicle.documents.map((d, i) => (
                <DocCard key={i} doc={d} />
              ))}
            </div>
          </div>
        )}

        {/* Pièces gravées */}
        {vehicle.parts && vehicle.parts.length > 0 && (
          <div className="cert-section">
            <h4 className="cert-section-title">
              <Hash size={13} /> Pièces Gravées Laser ({vehicle.parts.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {vehicle.parts.map((p, i) => (
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

        {/* ⑬ QR Code */}
        {vehicle.qr_image_data && (
          <div className="cert-section">
            <h4 className="cert-section-title">
              <QrCode size={13} /> ⑬ Code QR de Vérification National
            </h4>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              background: 'var(--color-bg-base)', border: '1px solid var(--color-border-light)',
              borderRadius: '14px', padding: '1rem 1.25rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                background: '#fff', padding: '6px', borderRadius: '8px',
                border: '1px solid #E2E8F0', flexShrink: 0,
              }}>
                <img src={vehicle.qr_image_data} alt="QR SPA" style={{ width: '90px', height: '90px', display: 'block' }} />
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                  QR Code SPA Officiel
                </div>
                {vehicle.secure_token && (
                  <code style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                    {vehicle.secure_token}
                  </code>
                )}
                <button onClick={onDownloadQR} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}>
                  <Download size={12} /> Télécharger le QR
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div className="cert-footer">
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
          🔐 Document généré par le Système de Protection Anti-Vol — SPA RDC · Ce certificat est infalsifiable.
        </span>
        <button onClick={onReset} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
          <X size={13} /> Nouvelle recherche
        </button>
      </div>
    </div>
  );
}

// ─── Main VerificationView ────────────────────────────────────────────────────

export default function VerificationView({ vehicles, autoToken, clearAutoToken }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const executeSearch = useCallback(async (searchToken) => {
    const cleanToken = (searchToken || '').trim();
    if (!cleanToken) return;

    setIsScanning(true);
    setScanStatus('Connexion à la base centrale SPA RDC...');
    setResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        try {
          const user = JSON.parse(currentUserStr);
          if (user.token) headers['Authorization'] = `Bearer ${user.token}`;
        } catch (e) { /* ignore */ }
      }

      setScanStatus('Interrogation du registre national...');
      const res = await fetch(`${API_BASE}/api/verify/qr/${encodeURIComponent(cleanToken)}`, { headers });
      const data = await res.json();

      setIsScanning(false);

      if (!res.ok || data.error) {
        setResult({ status: 'unknown', query: cleanToken });
      } else {
        setResult({
          status: data.vehicle_status,
          vehicle: {
            plate: data.plate_number,
            brand: data.brand,
            model: data.model,
            vin: data.vin,
            year: data.year_manufactured,
            color: data.color,
            category: data.vehicle_type,
            status: data.vehicle_status,
            owner: data.owner || { name: '—', phone: '—', email: '—', address: '—' },
            parts: data.parts || [],
            documents: data.documents || [],
            qr_image_data: data.qr_image_data,
            secure_token: data.secure_token,
            registered_at: data.registered_at,
            access_level: data.access_level,
            center_name: data.center_name,
            stolenReport: data.stolenReport || null,
          }
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setIsScanning(false);
      setResult({ status: 'unknown', query: cleanToken });
    }
  }, []);

  useEffect(() => {
    if (autoToken) {
      setQuery(autoToken);
      executeSearch(autoToken);
      if (clearAutoToken) clearAutoToken();
    }
  }, [autoToken, executeSearch, clearAutoToken]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const cleanQuery = query.trim().toUpperCase();
    const found = vehicles.find(v =>
      (v.plate && v.plate.toUpperCase() === cleanQuery) ||
      (v.vin && v.vin.toUpperCase() === cleanQuery) ||
      (v.qrCode && v.qrCode.toUpperCase() === cleanQuery) ||
      (v.parts && v.parts.some(p => p.id && p.id.toUpperCase() === cleanQuery))
    );
    if (found && found.qrCode) {
      executeSearch(found.qrCode);
    } else {
      executeSearch(cleanQuery);
    }
  };

  const handleQuickSearch = (token) => { setQuery(token); executeSearch(token); };

  const triggerScanner = () => {
    setIsScanning(true);
    setScanStatus('Initialisation caméra...');
    setTimeout(() => setScanStatus('Détection QR en cours...'), 1200);
    setTimeout(() => setScanStatus('Signature SPA détectée ! Déchiffrement...'), 2500);
    setTimeout(() => { setIsScanning(false); executeSearch('AA-123-BC'); }, 4000);
  };

  const downloadQR = (imgData, plate) => {
    if (!imgData) return;
    const a = document.createElement('a');
    a.href = imgData; a.download = `QR-SPA-${plate}.png`; a.click();
  };

  const handleReset = () => { setResult(null); setQuery(''); };

  return (
    <div className="verify-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      <div className="grid-2 gap-3">

        {/* ── LEFT: Search Panel ── */}
        <div>
          <div className="spa-card accent-card mb-3">
            <h2 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search className="text-sky" size={24} /> Module de Vérification SPA RDC
            </h2>
            <p className="mb-3" style={{ fontSize: '0.85rem' }}>
              Interrogez le registre centralisé national. Saisissez une plaque, un VIN, un jeton QR ou un code de pièce gravée laser.
            </p>

            {/* Quick test buttons */}
            <div className="mb-3" style={{ background: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                🧪 Tests rapides — Données réelles en base :
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleQuickSearch('AA-123-BC')} className="badge badge-authentic" style={{ cursor: 'pointer', background: 'rgba(5,150,105,0.1)', border: '1px solid var(--color-authentic)', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                  ✅ AA-123-BC (Authentique)
                </button>
                <button onClick={() => handleQuickSearch('BG-4321-BB')} className="badge badge-suspicious" style={{ cursor: 'pointer', background: 'rgba(206,16,46,0.1)', border: '1px solid var(--color-crimson)', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                  🚨 BG-4321-BB (Volé)
                </button>
                <button onClick={() => handleQuickSearch('CD-7890-KA')} className="badge badge-pending" style={{ cursor: 'pointer', background: 'rgba(217,119,6,0.1)', border: '1px solid var(--color-pending)', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                  ⏳ CD-7890-KA (En cours)
                </button>
                <button onClick={() => handleQuickSearch('CAT-90812')} className="badge" style={{ cursor: 'pointer', background: 'rgba(0,135,209,0.1)', border: '1px solid var(--color-sky-blue)', color: 'var(--color-sky-blue)', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                  🔩 CAT-90812 (Pièce)
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch}>
              {/* Type filter */}
              <div className="mb-2" style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-navy-900)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--color-navy-700)' }}>
                {['all', 'plate', 'qr', 'vin', 'part'].map((type) => (
                  <button
                    key={type} type="button" onClick={() => setSearchType(type)} className="btn"
                    style={{
                      flex: 1, padding: '0.4rem', fontSize: '0.72rem', borderRadius: '6px',
                      backgroundColor: searchType === type ? 'var(--color-navy-700)' : 'transparent',
                      color: searchType === type ? '#ffffff' : '#94A3B8',
                      border: 'none', fontFamily: 'var(--font-sans)', fontWeight: 600,
                    }}
                  >
                    {type === 'all' && 'Tout'}{type === 'plate' && 'Plaque'}
                    {type === 'qr' && 'QR Token'}{type === 'vin' && 'Châssis/VIN'}{type === 'part' && 'ID Pièce'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="form-group mb-2">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" className="form-control"
                    placeholder={
                      searchType === 'plate' ? 'Ex: AA-123-BC' :
                      searchType === 'qr' ? 'Ex: SPA-XXXXXXXXXXXXXXXX' :
                      searchType === 'vin' ? 'Saisir les 17 caractères VIN' :
                      searchType === 'part' ? 'Ex: CAT-90812' :
                      'Plaque, VIN, QR Token, Code Pièce...'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    style={{ paddingRight: '3rem', fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 600 }}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={!query.trim()}>
                  <Search size={16} /> Interroger le Registre SPA
                </button>
                <button type="button" onClick={triggerScanner} className="btn btn-secondary" title="Simuler un Scan QR">
                  <QrCode size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Scanner animation */}
          {isScanning && (
            <div className="spa-card text-center" style={{ border: '2px solid var(--color-sky-blue)', backgroundColor: '#020617' }}>
              <div className="scanning-zone">
                <div className="scanner-laser" />
                <div className="scan-aim-box">
                  <div className="scan-corner tl" /><div className="scan-corner tr" />
                  <div className="scan-corner bl" /><div className="scan-corner br" />
                  <QrCode size={64} style={{ color: 'var(--color-sky-blue)', opacity: 0.8 }} />
                </div>
              </div>
              <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <RefreshCw className="text-sky" size={16} style={{ animation: 'scannerMotion 2s infinite linear' }} />
                {scanStatus}
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Result Panel ── */}
        <div>
          {result ? (
            <div style={{ animation: 'scaleInAlert 0.3s ease-out' }}>

              {/* AUTHENTIC */}
              {result.status === 'authentic' && (
                <AuthenticCertificate
                  vehicle={result.vehicle}
                  onReset={handleReset}
                  onDownloadQR={() => downloadQR(result.vehicle.qr_image_data, result.vehicle.plate)}
                  onPrint={() => window.print()}
                />
              )}

              {/* STOLEN */}
              {result.status === 'suspicious' && (
                <div className="spa-card" style={{ borderLeft: '5px solid var(--color-crimson)', background: 'linear-gradient(to bottom, var(--color-card-bg) 0%, rgba(206,16,46,0.01) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(206,16,46,0.2)', paddingBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-suspicious" style={{ animation: 'blinkAlert 1.5s infinite linear', marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <ShieldAlert size={12} /> Véhicule Signalé — ALERTE ACTIVE
                      </span>
                      <h3 style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>ALERTE SÉCURITÉ NATIONALE</h3>
                    </div>
                    <ShieldAlert style={{ color: 'var(--color-crimson)', flexShrink: 0 }} size={28} />
                  </div>
                  <div className="stolen-alert-overlay mb-3" style={{ padding: '1.25rem', border: '1px solid var(--color-crimson)' }}>
                    <div className="alert-pulse-icon" style={{ marginBottom: '0.5rem' }}><ShieldAlert size={32} style={{ color: '#ffffff' }} /></div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>Signalement de Vol Actif — PNC</h4>
                    <p style={{ fontSize: '0.75rem', color: '#FFD1D1', marginTop: '0.5rem' }}>
                      Ce véhicule ou ses pièces sont signalés volés à la Police Nationale Congolaise. Toute transaction est susceptible de constituer un recel.
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <InfoCell label="Modèle Recherché" value={`${result.vehicle.brand} ${result.vehicle.model}`} />
                    <InfoCell label="Immatriculation" value={result.vehicle.plate} highlight="var(--color-crimson)" />
                    <InfoCell label="Propriétaire Légal" value={result.vehicle.owner?.name} />
                    <InfoCell label="Châssis / VIN" value={result.vehicle.vin} mono />
                  </div>
                  {result.vehicle.stolenReport && (
                    <div style={{ background: 'rgba(206,16,46,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px dashed rgba(206,16,46,0.25)', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-crimson)', display: 'block', fontWeight: 700, marginBottom: '0.4rem' }}>DÉTAILS DU SIGNALEMENT PNC :</span>
                      <p style={{ color: 'var(--color-text-main)', fontSize: '0.8rem' }}>
                        <strong>Réf. incident :</strong> {result.vehicle.stolenReport.incidentId}<br />
                        <strong>Date :</strong> {result.vehicle.stolenReport.date}<br />
                        <strong>Lieu :</strong> {result.vehicle.stolenReport.location}<br />
                        <strong>Statut :</strong> {result.vehicle.stolenReport.status}
                      </p>
                    </div>
                  )}
                  <div className="mt-3" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => alert('Alerte PNC transmise. Unité mobile la plus proche notifiée.')} className="btn btn-primary" style={{ backgroundColor: 'var(--color-crimson)', boxShadow: '0 4px 15px rgba(206,16,46,0.4)', flex: 1, fontSize: '0.82rem' }}>
                      <Send size={14} /> Transmettre Localisation PNC
                    </button>
                    <button onClick={() => window.print()} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                      <Printer size={14} /> Fiche PNC
                    </button>
                  </div>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                      <X size={14} /> Nouvelle recherche
                    </button>
                  </div>
                </div>
              )}

              {/* PENDING */}
              {result.status === 'pending' && (
                <div className="spa-card" style={{ borderLeft: '5px solid var(--color-pending)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-pending" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <Clock size={12} /> Dossier en cours de validation
                      </span>
                      <h3 style={{ color: 'var(--color-text-main)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                        {result.vehicle.brand} {result.vehicle.model}
                      </h3>
                    </div>
                    <Clock style={{ color: 'var(--color-pending)', flexShrink: 0 }} size={24} />
                  </div>
                  <div style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--color-pending)', fontSize: '0.85rem', fontWeight: 600 }}>
                      ⏳ Ce véhicule est en attente de gravage laser officiel au centre SPA le plus proche.
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <InfoCell label="Immatriculation" value={result.vehicle.plate} highlight="var(--color-pending)" />
                    <InfoCell label="Châssis / VIN" value={result.vehicle.vin} mono />
                    <InfoCell label="Propriétaire" value={result.vehicle.owner?.name} />
                    <InfoCell label="Date Dossier" value={formatDate(result.vehicle.registered_at)} />
                  </div>
                  <button onClick={() => alert('Rappel de convocation envoyé au propriétaire par SMS et Email.')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Relancer la planification du gravage
                  </button>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                      <X size={14} /> Nouvelle recherche
                    </button>
                  </div>
                </div>
              )}

              {/* UNKNOWN */}
              {result.status === 'unknown' && (
                <div className="spa-card" style={{ borderLeft: '5px solid var(--color-text-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
                    <AlertTriangle size={24} style={{ color: '#94A3B8' }} />
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(148,163,184,0.1)', color: 'var(--color-text-light)', border: '1px solid rgba(148,163,184,0.2)', marginBottom: '0.25rem', display: 'inline-flex' }}>
                        Non répertorié dans le registre SPA
                      </span>
                      <h3 style={{ color: 'var(--color-text-main)', fontFamily: 'var(--font-display)' }}>Aucune gravure détectée</h3>
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <p>L'identifiant saisi (<strong style={{ color: 'var(--color-sky-blue)' }}>{result.query}</strong>) ne correspond à aucun véhicule, pièce ou code QR dans le registre national <strong>SPA RDC</strong>.</p>
                  </div>
                  <div className="stolen-alert-overlay mb-3" style={{ padding: '1.25rem', border: '1px solid var(--color-navy-700)', background: 'var(--color-navy-800)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: '0.25rem' }}>⚠️ Vigilance — Pièces Non Marquées</h4>
                    <p style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                      Si vous tentez d'acquérir une pièce sans gravage SPA visible, ou dont le marquage a été altéré ou effacé, cette pièce provient probablement d'un véhicule volé.
                    </p>
                  </div>
                  <button onClick={() => alert('Signalement d\'une pièce suspecte transmis aux inspecteurs SPA de votre région.')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <AlertTriangle size={14} /> Signaler une pièce d'origine suspecte
                  </button>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                      <X size={14} /> Nouvelle recherche
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Empty state */
            <div className="spa-card flex-center" style={{ minHeight: '350px', flexDirection: 'column', color: 'var(--color-text-light)', borderStyle: 'dashed', borderColor: 'var(--color-border-light)' }}>
              <Search size={52} style={{ opacity: 0.25, marginBottom: '1rem', color: 'var(--color-sky-blue)' }} />
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>En attente d'une requête</h3>
              <p style={{ fontSize: '0.8rem', textAlign: 'center', maxWidth: '300px', color: 'var(--color-text-subtle)' }}>
                Entrez un critère de recherche ou cliquez sur un exemple de test pour interroger la base de données SPA RDC.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
