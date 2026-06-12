import React, { useState } from 'react';
import { Radio, Send, Users, MapPin, ShieldAlert, Check, RefreshCw, Navigation } from 'lucide-react';

export default function MobileIntervention() {
  // Mobile squads in Kinshasa initial state
  const [squads, setSquads] = useState([
    { id: 'SQUAD-01', region: 'Kinshasa - Gombe', inspector: 'Diallo Diallo', status: 'En Patrouille', mission: 'Contrôles aléatoires Boulevard 30 Juin', battery: '92%' },
    { id: 'SQUAD-02', region: 'Kinshasa - Ngaliema', inspector: 'Kabasele Aimé', status: 'En Mission', mission: 'Intervention sur pièce suspecte à Kintambo Magasin', battery: '78%' },
    { id: 'SQUAD-03', region: 'Kinshasa - Limete', inspector: 'Mavinga Roger', status: 'Disponible', mission: 'Standby au poste de contrôle Limete interchange', battery: '85%' },
    { id: 'SQUAD-04', region: 'Kinshasa - Bandalungwa', inspector: 'Bondo Christian', status: 'Disponible', mission: 'Standby Boulevard Triomphal', battery: '95%' }
  ]);

  // Form states for dispatching a new squad mission
  const [targetCommune, setTargetCommune] = useState('Gombe');
  const [targetPlate, setTargetPlate] = useState('');
  const [incidentType, setIncidentType] = useState('Recel Suspect');
  const [priority, setPriority] = useState('HIGH');
  const [selectedSquad, setSelectedSquad] = useState('SQUAD-03');

  // Local helper to dispatch mission
  const handleDispatch = (e) => {
    e.preventDefault();
    if (!targetPlate) {
      alert('Veuillez spécifier la plaque du véhicule ou de la pièce concernée.');
      return;
    }

    // Update squad status in-memory
    setSquads(prev => prev.map(s => {
      if (s.id === selectedSquad) {
        return {
          ...s,
          status: 'En Mission',
          mission: `[PRIORITÉ ${priority}] Intervention d'urgence pour ${incidentType} sur véhicule ${targetPlate.toUpperCase()} à Kinshasa - ${targetCommune}.`
        };
      }
      return s;
    }));

    alert(`Ordre d'intervention transmis avec succès à l'unité ${selectedSquad} !`);
    setTargetPlate('');
  };

  const handlePingSquad = (squadId) => {
    alert(`Signal GPS forcé envoyé à l'unité ${squadId}. Coordonnées reçues : 4°19'S 15°18'E (Kinshasa).`);
  };

  return (
    <div className="mobile-intervention-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      <div className="grid-2 gap-3">
        
        {/* Left Column: Dispatcher form */}
        <div className="spa-card accent-card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <h2 className="mb-2"><Radio className="text-sky" size={24} style={{ display: 'inline', marginRight: '8px' }} />Console de Dispatching d'Urgence</h2>
          <p className="mb-3" style={{ fontSize: '0.85rem' }}>
            Déployez instantanément une unité mobile sur le terrain en cas de détection de pièce volée ou de refus d'obtempérer lors d'un contrôle.
          </p>

          <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Commune d'Intervention</label>
                <select className="form-control" value={targetCommune} onChange={(e) => setTargetCommune(e.target.value)}>
                  <option value="Gombe">Gombe</option>
                  <option value="Limete">Limete</option>
                  <option value="Ngaliema">Ngaliema</option>
                  <option value="Bandalungwa">Bandalungwa</option>
                  <option value="Kasa-Vubu">Kasa-Vubu</option>
                  <option value="Masina">Masina</option>
                </select>
              </div>

              <div className="form-group">
                <label>Plaque d'Immatriculation Cible *</label>
                <input required type="text" className="form-control" placeholder="Ex: BG-4321-BB" value={targetPlate} onChange={(e) => setTargetPlate(e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Nature du Signalement</label>
                <select className="form-control" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                  <option value="Recel Suspect">Recel de pièce marquée</option>
                  <option value="Véhicule Recherché">Véhicule signalé volé</option>
                  <option value="Gravage Altéré">Altération de gravage laser</option>
                  <option value="Assistance PNC">Assistance Police Routière</option>
                </select>
              </div>

              <div className="form-group">
                <label>Niveau de Priorité</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">Basse (Enquête)</option>
                  <option value="MEDIUM">Moyenne (Vérification)</option>
                  <option value="HIGH">Haute (Intervention immédiate)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Attribuer la Mission à l'Unité</label>
              <select className="form-control" value={selectedSquad} onChange={(e) => setSelectedSquad(e.target.value)}>
                {squads.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.inspector} ({s.status === 'Disponible' ? 'DISPONIBLE' : 'EN PATROUILLE/MISSION'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--color-crimson)', boxShadow: '0 4px 15px rgba(206,16,46,0.3)' }}>
                <Send size={16} /> Lancer le déploiement de l'Unité
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Squad list */}
        <div className="spa-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-navy-700)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
                <Users className="text-gold" size={20} /> Unités Mobiles en Service
              </h3>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>État des patrouilles d'inspection et de gravage physique de la RDC.</p>
            </div>
            <span className="badge badge-authentic" style={{ color: 'var(--color-sky-blue)', borderColor: 'rgba(0,135,209,0.3)', backgroundColor: 'rgba(0,135,209,0.1)' }}>
              4 UNITÉS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {squads.map(s => (
              <div key={s.id} style={{ border: '1px solid var(--color-navy-700)', padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--color-navy-900)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{s.id}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>| {s.inspector}</span>
                  </div>
                  <span className={`badge ${
                    s.status === 'Disponible' ? 'badge-authentic' : 
                    s.status === 'En Patrouille' ? 'badge-pending' : 
                    'badge-suspicious'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {s.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                  <MapPin size={12} className="text-sky" />
                  <span>Secteur : <strong>{s.region}</strong></span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#CBD5E1', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                  <strong>Mission : </strong> {s.mission}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Batterie Terminal : <strong>{s.battery}</strong></span>
                  <button onClick={() => handlePingSquad(s.id)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Navigation size={10} /> Localiser GPS
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
