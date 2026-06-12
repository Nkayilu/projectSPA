import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Search, Radio, Eye, Printer, AlertTriangle, User, Calendar, MapPin, Check } from 'lucide-react';

export default function PoliceConsole({ vehicles }) {
  const [query, setQuery] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  
  // Custom mock alerts log for police history
  const [policeLogs, setPoliceLogs] = useState([
    { time: '13:02', location: 'Limete (Rond-point Limete)', plate: 'BG-4321-BB', status: 'SIGNALÉ VOLÉ', details: 'Saisie opérée par SQUAD-03, véhicule immobilisé.' },
    { time: '12:44', location: 'Gombe (Boulevard 30 Juin)', plate: 'AA-123-BC', status: 'AUTHENTIQUE', details: 'Contrôle de routine positif. Véhicule 100% gravé.' },
    { time: '11:15', location: 'Ngaliema (Délvaux)', plate: 'CGO-8921', status: 'NON ENREGISTRÉ', details: 'Avertissement verbal pour défaut d\'immatriculation SPA.' }
  ]);

  const handlePoliceSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const cleanQuery = query.trim().toUpperCase();

    // Check custom registrations
    const found = vehicles.find(v => 
      v.plate.toUpperCase() === cleanQuery || 
      v.vin.toUpperCase() === cleanQuery ||
      v.qrCode.toUpperCase() === cleanQuery
    );

    if (found) {
      setCheckResult(found);
      
      // Append to police activity logs
      setPoliceLogs(prev => [
        { 
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), 
          location: 'Kinshasa - Gombe (HQ Police)', 
          plate: found.plate, 
          status: found.status === 'suspicious' ? 'SIGNALÉ VOLÉ' : 'AUTHENTIQUE',
          details: found.status === 'suspicious' ? 'ALERTE PING: Alerte rouge PNC transmise.' : 'Contrôle positif.'
        },
        ...prev
      ]);
      return;
    }

    // Default Seed checks
    if (cleanQuery === 'AA-123-BC') {
      setCheckResult({
        plate: 'AA-123-BC',
        brand: 'Toyota',
        model: 'Land Cruiser Prado',
        vin: 'JTFGD21HA89012345',
        year: '2021',
        color: 'Blanc Nacré',
        owner: { name: 'Kabasele Mwamba Dieudonné', id: 'ID-CG-9081273' },
        status: 'authentic',
        engravedDate: '12/03/2023',
        center: 'Centre Kinshasa - Gombe'
      });
    } else if (cleanQuery === 'VOL-999-AA' || cleanQuery === 'BG-4321-BB' || cleanQuery === 'VOLÉ') {
      setCheckResult({
        plate: 'BG-4321-BB',
        brand: 'Lexus',
        model: 'LX 570',
        vin: 'JTJHY78WF90001234',
        year: '2019',
        color: 'Noir Métallisé',
        owner: { name: 'Mbuyi Kalombo Jean-Paul', id: 'ID-CG-5120938' },
        status: 'suspicious',
        stolenReport: {
          date: '21/05/2026',
          location: 'Kinshasa - Limete (Poids Lourds)',
          incidentId: 'INC-2026-9021'
        }
      });
    } else {
      setCheckResult({
        plate: cleanQuery,
        brand: 'Non identifié',
        model: 'Inconnu',
        vin: 'N/A',
        status: 'unknown',
        owner: { name: 'Non répertorié' }
      });
    }
  };

  return (
    <div className="police-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      
      <div className="police-console">
        
        {/* Title bar */}
        <div className="police-title-bar">
          <h2 className="police-title">
            <Radio className="text-crimson" size={24} style={{ animation: 'blinkAlert 1s infinite linear' }} />
            Police Nationale Congolaise (PNC) – Portail de Contrôle SPA
          </h2>
          <span className="police-badge-indicator">CONEXION SÉCURISÉE</span>
        </div>

        <div className="grid-2 gap-3">
          
          {/* Left Side: PNC Instant Search & Ticker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="spa-card" style={{ backgroundColor: 'var(--color-navy-950)', border: '1px solid var(--color-crimson)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Search size={16} className="text-crimson" /> Requête d'Immatriculation Routière Rapide
              </h3>
              
              {/* Quick Seeds for Police */}
              <div className="mb-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setQuery('AA-123-BC'); handlePoliceSearch(); }} className="badge badge-authentic" style={{ cursor: 'pointer', background: 'rgba(16,185,129,0.1)' }}>Test Authentique (AA-123-BC)</button>
                <button onClick={() => { setQuery('BG-4321-BB'); handlePoliceSearch(); }} className="badge badge-suspicious" style={{ cursor: 'pointer', background: 'rgba(206,16,46,0.1)' }}>Test Volé (BG-4321-BB)</button>
              </div>

              <form onSubmit={handlePoliceSearch}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="SAISIR PLAQUE OU VIN CONGOLAIS..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', borderColor: 'var(--color-crimson)', background: '#020617', letterSpacing: '0.05em' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-crimson)', borderColor: 'var(--color-crimson)' }}>
                    Rechercher
                  </button>
                </div>
              </form>
            </div>

            {/* PNC Ticker Alerts history */}
            <div className="spa-card" style={{ flex: 1, backgroundColor: 'var(--color-navy-950)' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem', borderBottom: '1px solid var(--color-navy-700)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle className="text-gold" size={16} /> Journal des Signalements Récents (Kinshasa)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto' }}>
                {policeLogs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-navy-800)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{log.time}</span>
                        <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{log.plate}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-sky-blue)' }}>({log.location})</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>{log.details}</p>
                    </div>

                    <span className={`badge ${
                      log.status === 'AUTHENTIQUE' ? 'badge-authentic' : 
                      log.status === 'SIGNALÉ VOLÉ' ? 'badge-suspicious' : 
                      'badge-pending'
                    }`} style={{ fontSize: '0.6rem' }}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: High contrast alert console reports */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {checkResult ? (
              <div style={{ animation: 'scaleInAlert 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', flex: 1 }}>
                
                {/* 1. SECURE RECORD FOUND */}
                {checkResult.status === 'authentic' && (
                  <div className="spa-card" style={{ height: '100%', border: '2px solid var(--color-authentic)', backgroundColor: '#022114' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <span className="badge badge-authentic"><ShieldCheck size={12} /> CONFORME</span>
                        <h3 style={{ marginTop: '0.25rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>Véhicule Sécurisé</h3>
                      </div>
                      <ShieldCheck size={32} className="text-emerald" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <span style={{ color: '#88CBB0', fontSize: '0.7rem', display: 'block' }}>PLAQUE</span>
                          <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>{checkResult.plate}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#88CBB0', fontSize: '0.7rem', display: 'block' }}>CHÂSSIS (VIN)</span>
                          <code style={{ fontSize: '0.8rem', color: '#ffffff' }}>{checkResult.vin}</code>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '0.8rem' }}>
                        <div>
                          <span style={{ color: '#88CBB0', fontSize: '0.7rem', display: 'block' }}>PROPRIÉTAIRE</span>
                          <strong style={{ color: '#ffffff' }}><User size={12} style={{ display: 'inline', marginRight: '4px' }} />{checkResult.owner.name}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#88CBB0', fontSize: '0.7rem', display: 'block' }}>PIÈCE IDENTITÉ</span>
                          <span style={{ color: '#ffffff' }}>{checkResult.owner.id || 'ID-CG-9081'}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '0.8rem' }}>
                        <span style={{ color: '#88CBB0', fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem' }}>PIÈCES ENREGISTRÉES AU GRAVAGE :</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>✓ Catalyseur Principal</div>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>✓ Rétroviseurs (x2)</div>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>✓ Vitrages (x6)</div>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>✓ Moteur</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                      <button onClick={() => alert('Vérification validée. Signal transmis au centre.')} className="btn btn-secondary" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                        Enregistrer Passage
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CRITICAL ALERT / STOLEN VEHICLE */}
                {checkResult.status === 'suspicious' && (
                  <div className="stolen-alert-overlay flex-center" style={{ height: '100%', flexDirection: 'column', padding: '2rem', border: '3px solid var(--color-gold)' }}>
                    <div className="alert-pulse-icon" style={{ marginBottom: '1.5rem' }}>
                      <ShieldAlert size={64} style={{ color: '#ffffff' }} />
                    </div>

                    <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>VÉHICULE SIGNALÉ VOLÉ</h2>
                    <span className="badge badge-suspicious" style={{ backgroundColor: '#ffffff', color: 'var(--color-crimson)', fontWeight: 800, fontSize: '0.8rem', padding: '0.4rem 1rem', marginBottom: '1.5rem', border: 'none' }}>ALERTE ROUGE INTERCEPT</span>

                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: '100%', textAlign: 'left', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      <div className="cert-row" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><span style={{ color: '#FFB1B1' }}>PLAQUE :</span><span style={{ color: '#ffffff', fontFamily: 'var(--font-display)' }}>{checkResult.plate}</span></div>
                      <div className="cert-row" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><span style={{ color: '#FFB1B1' }}>MODÈLE :</span><span style={{ color: '#ffffff' }}>{checkResult.brand} {checkResult.model}</span></div>
                      <div className="cert-row" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><span style={{ color: '#FFB1B1' }}>PROPRIÉTAIRE :</span><span style={{ color: '#ffffff' }}>{checkResult.owner.name}</span></div>
                      <div className="cert-row" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><span style={{ color: '#FFB1B1' }}>DÉCLARÉ VOLÉ LE :</span><span style={{ color: 'var(--color-gold)' }}>{checkResult.stolenReport.date}</span></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                      <button onClick={() => alert('Forces de Police d\'Interception routière dépêchées sur vos coordonnées.')} className="btn btn-primary" style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-navy-950)', flex: 1, fontWeight: 800 }}>
                        ORDONNER L'INTERCEPTIONS
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. UNKNOWN / NON ENREGISTRÉ */}
                {checkResult.status === 'unknown' && (
                  <div className="spa-card" style={{ height: '100%', border: '2px dashed var(--color-navy-600)', backgroundColor: 'rgba(27,46,92,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-navy-700)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#CBD5E1' }}><AlertTriangle size={12} /> NON MARQUÉ</span>
                        <h3 style={{ marginTop: '0.25rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>Défaut de Marquage Laser</h3>
                      </div>
                      <AlertTriangle size={32} className="text-gold" />
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '1.5rem' }}>
                      La plaque <strong>{checkResult.plate}</strong> n'est pas répertoriée dans la base nationale SPA. Le véhicule n'est pas protégé par le système de traçabilité laser.
                    </p>

                    <div style={{ background: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-navy-700)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                      <span style={{ display: 'block', color: 'var(--color-gold)', fontWeight: 700, marginBottom: '0.25rem' }}>Consignes PNC :</span>
                      Rappeler verbalement au conducteur l'obligation d'enregistrer le véhicule et de procéder au marquage laser dans un centre agréé pour réduire les risques de vol.
                    </div>

                    <button onClick={() => alert('Fiche d\'infraction émise au conducteur.')} className="btn btn-secondary" style={{ width: '100%' }}>
                      Émettre un Avertissement
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="spa-card flex-center" style={{ height: '100%', border: '2px dashed rgba(206, 16, 46, 0.3)', minHeight: '380px', flexDirection: 'column', color: '#94A3B8' }}>
                <Eye size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--color-crimson)' }} />
                <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Console PNC en veille</h4>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: '240px' }}>Saisissez un numéro de plaque routière ou utilisez les exemples rapides pour exécuter un contrôle de police.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
