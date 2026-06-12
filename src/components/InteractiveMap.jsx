import React, { useState } from 'react';
import { Map, MapPin, Radio, ShieldAlert, Sparkles, Navigation, Layers, ShieldCheck } from 'lucide-react';

export default function InteractiveMap({ centers = [], squads = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [mapLayer, setMapLayer] = useState('all'); // all, centers, risk, squads

  // Predefined risk zones
  const riskZones = [
    { id: 'rsk-01', name: 'Zone de Vol Fréquent - Victoire', type: 'risk', x: 220, y: 210, desc: 'Secteur de haut vol d\'accessoires automobiles (rétroviseurs, enjoliveurs). Contrôle renforcé.', level: 'ÉLEVÉ', count: '14 vols signalés ce mois' },
    { id: 'rsk-02', name: 'Zone de Vol Fréquent - Marché de la Liberté', type: 'risk', x: 480, y: 320, desc: 'Vente suspecte de pièces d\'occasion non tracées détectée. Patrouilles fréquentes.', level: 'CRITIQUE', count: '29 vols signalés ce mois' },
    { id: 'rsk-03', name: 'Zone de Vol Fréquent - Kintambo Magasin', type: 'risk', x: 120, y: 190, desc: 'Vols à l\'arraché lors d\'embouteillages. Gravage laser hautement conseillé.', level: 'MOYEN', count: '8 vols signalés ce mois' }
  ];

  // Combine dynamic CRUD data with static risk zones
  const mapLocations = [
    ...centers.map(c => ({
      id: c.id,
      name: c.name,
      type: 'center',
      x: c.x || 150,
      y: c.y || 150,
      desc: c.desc || 'Centre de gravage agréé RDC.',
      staff: c.staff || 'N/A',
      status: c.status || 'Ouvert'
    })),
    ...riskZones,
    ...squads.map(s => ({
      id: s.id,
      name: `Patrouille ${s.id}`,
      type: 'squad',
      x: s.x || 200,
      y: s.y || 200,
      inspector: s.inspector,
      mission: s.mission || 'Standby au secteur'
    }))
  ];

  const filteredLocations = mapLocations.filter(loc => {
    if (mapLayer === 'all') return true;
    if (mapLayer === 'centers') return loc.type === 'center';
    if (mapLayer === 'risk') return loc.type === 'risk';
    if (mapLayer === 'squads') return loc.type === 'squad';
    return true;
  });

  return (
    <div className="map-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      
      {/* Top Map bar */}
      <div className="spa-card mb-2" style={{ padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
              <Map className="text-sky" size={24} /> Carte Interactive de Kinshasa
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Position des centres SPA, zones de risques cibles, et déploiements en temps réel.</p>
          </div>

          {/* Layer Selector */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--color-navy-900)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--color-navy-700)' }}>
            {['all', 'centers', 'risk', 'squads'].map((layer) => (
              <button
                key={layer}
                onClick={() => setMapLayer(layer)}
                className="btn"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: mapLayer === layer ? 'var(--color-navy-700)' : 'transparent',
                  color: mapLayer === layer ? '#ffffff' : '#94A3B8',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600
                }}
              >
                {layer === 'all' && 'Tout afficher'}
                {layer === 'centers' && 'Centres SPA'}
                {layer === 'risk' && 'Zones Risques'}
                {layer === 'squads' && 'Unités Mobiles'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3 gap-3">
        
        {/* Left Columns: Interactive Kinshasa Map Canvas */}
        <div className="spa-card accent-card" style={{ gridColumn: 'span 2', padding: '1rem' }}>
          
          <div className="kin-map-canvas" style={{ position: 'relative' }}>
            
            {/* Grid overlay for futuristic vibe */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '25px 25px', pointerEvents: 'none' }}></div>
            
            {/* Beautiful Stylized SVG outline representing Congo River and major Kinshasa borders */}
            <svg viewBox="0 0 600 450" style={{ width: '100%', height: '100%', fill: 'none' }}>
              
              {/* Congo River (Fleuve Congo) */}
              <path d="M-50,80 Q 80,40 160,70 T 260,110 T 380,90 T 520,30 T 650,-20" stroke="rgba(0, 135, 209, 0.25)" strokeWidth="32" strokeLinecap="round" />
              <path d="M-50,80 Q 80,40 160,70 T 260,110 T 380,90 T 520,30 T 650,-20" stroke="rgba(0, 135, 209, 0.15)" strokeWidth="48" strokeLinecap="round" />
              <text x="420" y="80" fill="rgba(0, 135, 209, 0.4)" fontSize="10" fontFamily="var(--font-crest)" letterSpacing="2">FLEUVE CONGO</text>

              {/* Commune general boundaries outlines - stylized abstract polygons */}
              {/* Gombe */}
              <polygon points="120,130 260,120 280,180 180,190 140,160" stroke="rgba(255,255,255,0.05)" fill="rgba(0, 135, 209, 0.03)" strokeWidth="1" />
              <text x="170" y="160" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="700">GOMBE</text>

              {/* Ngaliema */}
              <polygon points="20,160 140,160 180,190 150,300 30,270" stroke="rgba(255,255,255,0.05)" fill="rgba(255,255,255,0.01)" strokeWidth="1" />
              <text x="60" y="210" fill="rgba(255,255,255,0.15)" fontSize="9" fontWeight="700">NGALIEMA</text>

              {/* Limete */}
              <polygon points="280,180 380,170 420,300 320,320 280,240" stroke="rgba(255,255,255,0.05)" fill="rgba(0, 135, 209, 0.02)" strokeWidth="1" />
              <text x="320" y="230" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="700">LIMETE</text>

              {/* Bandalungwa & Kasa-Vubu */}
              <polygon points="180,190 280,180 280,240 180,250" stroke="rgba(255,255,255,0.05)" fill="rgba(252, 209, 22, 0.01)" strokeWidth="1" />
              <text x="200" y="220" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="700">BANDAL</text>

            </svg>

            {/* DYNAMIC MARKERS PLACEMENT */}
            {filteredLocations.map(loc => {
              
              if (loc.type === 'center') {
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedNode(loc)}
                    className="map-checkpoint"
                    style={{ left: `${loc.x}px`, top: `${loc.y}px` }}
                    title={loc.name}
                  >
                    <div style={{ position: 'absolute', top: '-1.8rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-navy-950)', border: '1px solid var(--color-sky-blue)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '0.6rem', color: '#ffffff', fontWeight: 800 }}>SPA</div>
                  </div>
                );
              }

              if (loc.type === 'risk') {
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedNode(loc)}
                    className="map-incident"
                    style={{ left: `${loc.x}px`, top: `${loc.y}px` }}
                    title={loc.name}
                  >
                    {/* Pulsating danger zone ring */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', border: '2px solid var(--color-crimson)', borderRadius: '50%', animation: 'pulseCrimson 2s infinite', pointerEvents: 'none' }}></div>
                  </div>
                );
              }

              if (loc.type === 'squad') {
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedNode(loc)}
                    className="map-squad"
                    style={{ left: `${loc.x}px`, top: `${loc.y}px` }}
                    title={loc.name}
                  >
                    <div style={{ position: 'absolute', top: '-1.8rem', left: '50%', transform: 'translateX(-50%) rotate(-45deg)', backgroundColor: 'var(--color-navy-950)', border: '1px solid var(--color-gold)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '0.55rem', color: 'var(--color-gold)', fontWeight: 800 }}>SQUAD</div>
                  </div>
                );
              }

              return null;
            })}

          </div>

        </div>

        {/* Right Column: Node details context box */}
        <div className="spa-card flex-center" style={{ flexDirection: 'column', textAlign: 'left', minHeight: '350px' }}>
          
          {selectedNode ? (
            <div style={{ width: '100%', animation: 'scaleInAlert 0.3s ease-out' }}>
              
              {/* Type Badge */}
              <span className={`badge ${
                selectedNode.type === 'center' ? 'badge-authentic' : 
                selectedNode.type === 'squad' ? 'badge-pending' : 
                'badge-suspicious'
              }`} style={{ marginBottom: '1rem' }}>
                {selectedNode.type === 'center' && <ShieldCheck size={12} />}
                {selectedNode.type === 'squad' && <Navigation size={12} />}
                {selectedNode.type === 'risk' && <ShieldAlert size={12} />}
                {selectedNode.type === 'center' && 'Centre SPA Agréé'}
                {selectedNode.type === 'squad' && 'Patrouille Active'}
                {selectedNode.type === 'risk' && 'Zone Rouge Risque'}
              </span>

              <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>{selectedNode.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', marginBottom: '1.5rem' }}>{selectedNode.desc || 'Localisation active surveillée par le système centralisé SPA RDC.'}</p>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                
                {selectedNode.type === 'center' && (
                  <>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Effectif : </span><strong style={{ color: 'var(--color-text-main)' }}>{selectedNode.staff}</strong></div>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Statut Opérationnel : </span><strong className="text-emerald">{selectedNode.status}</strong></div>
                  </>
                )}

                {selectedNode.type === 'risk' && (
                  <>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Niveau de Risque : </span><strong className="text-crimson">{selectedNode.level}</strong></div>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Rapports de Vol : </span><strong style={{ color: 'var(--color-text-main)' }}>{selectedNode.count}</strong></div>
                  </>
                )}

                {selectedNode.type === 'squad' && (
                  <>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Inspecteur Chef : </span><strong style={{ color: 'var(--color-text-main)' }}>{selectedNode.inspector}</strong></div>
                    <div><span style={{ color: 'var(--color-text-light)' }}>Mission assignée : </span><strong className="text-gold">{selectedNode.mission}</strong></div>
                  </>
                )}

              </div>

              {selectedNode.type === 'risk' && (
                <button onClick={() => alert('Une unité mobile a été redirigée pour intensifier les patrouilles dans cette zone.')} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: 'var(--color-crimson)', borderColor: 'var(--color-crimson)', fontSize: '0.8rem' }}>
                  <Radio size={14} /> Dépêcher Renforts
                </button>
              )}

            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>
              <Layers size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--color-sky-blue)' }} />
              <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Sélectionnez un marqueur</h4>
              <p style={{ fontSize: '0.75rem', maxWidth: '240px', margin: '0 auto', color: 'var(--color-text-subtle)' }}>Cliquez sur les centres SPA, les patrouilles ou les zones de risque sur la carte pour obtenir des informations détaillées.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
