import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, QrCode, ShieldAlert, Sparkles, TrendingUp, Users, MapPin, Radio, Activity, Map, RefreshCw, Car } from 'lucide-react';

const API_BASE = '';

export default function AdminDashboard({ vehicles, setTab }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [vehicles]); // Re-fetch when vehicles change

  const communeStats = [
    { name: 'Gombe', registered: 42300, alerts: 1, revenue: '169.2K $' },
    { name: 'Limete', registered: 31200, alerts: 4, revenue: '124.8K $' },
    { name: 'Ngaliema', registered: 28900, alerts: 2, revenue: '115.6K $' },
    { name: 'Bandalungwa', registered: 19400, alerts: 3, revenue: '77.6K $' },
    { name: 'Kasa-Vubu', registered: 12500, alerts: 0, revenue: '50.0K $' },
    { name: 'Masina', registered: 9800, alerts: 4, revenue: '39.2K $' }
  ];

  const dispatchLogs = [
    { time: '13:14', unit: 'SQUAD-01 (Gombe)', activity: 'Contrôle routier Rond-point MDN. 4 véhicules vérifiés. Tous en règle.' },
    { time: '13:02', unit: 'SQUAD-03 (Limete)', activity: 'Alerte fraude résolue. Rétroviseur volé saisi chez un revendeur non agréé.' },
    { time: '12:45', unit: 'SQUAD-02 (Ngaliema)', activity: 'Déploiement en cours vers Delvaux suite à signalement d\'une pièce suspecte.' },
    { time: '12:15', unit: 'HQ Central RDC', activity: 'Génération de 48 nouveaux certificats d\'enregistrement numérique.' }
  ];

  // Utiliser les stats API si disponibles, sinon fallback sur vehicles prop
  const totalVehicles = stats?.totalVehicles ?? vehicles.length;
  const authentic = stats?.authentic ?? vehicles.filter(v => v.status === 'authentic').length;
  const suspicious = stats?.suspicious ?? vehicles.filter(v => v.status === 'suspicious').length;
  const pending = stats?.pending ?? vehicles.filter(v => v.status === 'pending').length;
  const totalParts = stats?.totalParts ?? vehicles.reduce((sum, v) => sum + (v.parts?.length || 0), 0);
  const totalCenters = stats?.totalCenters ?? 0;
  const totalSquads = stats?.totalSquads ?? 0;
  const recentVehicles = stats?.recentVehicles ?? [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-container" style={{ padding: '2rem', animation: 'scaleInAlert 0.4s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-text-main)' }}>
            Tableau de Bord Administrateur
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Vue consolidée en temps réel — Base de données SQLite SPA RDC
          </p>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }} disabled={loadingStats}>
          <RefreshCw size={14} style={{ animation: loadingStats ? 'scannerMotion 1s infinite linear' : 'none' }} />
          {loadingStats ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {/* 4 KPI Cards */}
      <section className="dashboard-grid mb-3">

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-sky-blue)' }}>
          <div className="stat-info">
            <span className="stat-label">Véhicules en Base</span>
            <span className="stat-value">{loadingStats ? '…' : totalVehicles.toLocaleString()}</span>
            <span className="stat-change up" style={{ color: 'var(--color-sky-blue)' }}>
              <TrendingUp size={12} /> Registre national SPA
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-sky-blue)', backgroundColor: 'rgba(0, 135, 209, 0.08)' }}>
            <Car size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-authentic)' }}>
          <div className="stat-info">
            <span className="stat-label">Véhicules Authentiques</span>
            <span className="stat-value" style={{ color: 'var(--color-authentic)' }}>{loadingStats ? '…' : authentic.toLocaleString()}</span>
            <span className="stat-change up">
              <ShieldCheck size={12} /> Certifiés SPA RDC
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-authentic)', backgroundColor: 'rgba(5, 150, 105, 0.08)' }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-gold)' }}>
          <div className="stat-info">
            <span className="stat-label">Pièces Gravées Laser</span>
            <span className="stat-value">{loadingStats ? '…' : totalParts.toLocaleString()}</span>
            <span className="stat-change up" style={{ color: 'var(--color-gold)' }}>
              <Sparkles size={12} /> Traçabilité active
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: '#D4AF37', backgroundColor: 'rgba(252, 209, 22, 0.1)' }}>
            <Cpu size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-crimson)' }}>
          <div className="stat-info">
            <span className="stat-label">Alertes Vols</span>
            <span className="stat-value" style={{ color: suspicious > 0 ? 'var(--color-crimson)' : 'var(--color-text-main)' }}>
              {loadingStats ? '…' : suspicious.toLocaleString()}
            </span>
            <span className="stat-change down">
              <ShieldAlert size={12} /> Signalés PNC
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-crimson)', backgroundColor: 'rgba(206, 16, 46, 0.08)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>

      </section>

      {/* Ligne secondaire : centres + patrouilles + en attente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-navy-600)' }}>
          <div className="stat-info">
            <span className="stat-label">Centres Agréés</span>
            <span className="stat-value" style={{ fontSize: '1.5rem' }}>{loadingStats ? '…' : totalCenters}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Stations actives RDC</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-sky-blue)', backgroundColor: 'rgba(0,135,209,0.08)' }}>
            <MapPin size={20} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #8B5CF6' }}>
          <div className="stat-info">
            <span className="stat-label">Patrouilles Mobiles</span>
            <span className="stat-value" style={{ fontSize: '1.5rem' }}>{loadingStats ? '…' : totalSquads}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Unités déployées</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.08)' }}>
            <Radio size={20} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-pending)' }}>
          <div className="stat-info">
            <span className="stat-label">En Attente Gravage</span>
            <span className="stat-value" style={{ fontSize: '1.5rem', color: pending > 0 ? 'var(--color-pending)' : 'inherit' }}>{loadingStats ? '…' : pending}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Dossiers incomplets</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-pending)', backgroundColor: 'rgba(217,119,6,0.08)' }}>
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid-2 gap-3 mb-3">

        {/* Tableau : derniers véhicules enregistrés */}
        <div className="spa-card accent-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-text-main)', fontSize: '1rem' }}>
              <Car className="text-sky" size={18} /> Derniers Enregistrements
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>5 plus récents</span>
          </div>

          {recentVehicles.length > 0 ? (
            <div className="spa-table-wrapper">
              <table className="spa-table">
                <thead>
                  <tr>
                    <th>Plaque</th>
                    <th>Véhicule</th>
                    <th>Propriétaire</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVehicles.map((v, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: 'var(--color-sky-blue)' }}>{v.plate_number}</strong></td>
                      <td style={{ fontSize: '0.82rem' }}>{v.brand} {v.model}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>{v.owner || '—'}</td>
                      <td>
                        <span className={`badge ${v.status === 'authentic' ? 'badge-authentic' : v.status === 'suspicious' ? 'badge-suspicious' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                          {v.status === 'authentic' && '✅ Auth'}
                          {v.status === 'suspicious' && '🚨 Volé'}
                          {v.status === 'pending' && '⏳ Attente'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{formatDate(v.registered_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Statistiques géographiques si pas encore de données API */
            <div className="spa-table-wrapper">
              <table className="spa-table">
                <thead>
                  <tr>
                    <th>Commune</th>
                    <th>Marquages</th>
                    <th>Alertes</th>
                    <th>Recettes</th>
                  </tr>
                </thead>
                <tbody>
                  {communeStats.map((commune, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{commune.name}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{commune.registered.toLocaleString()}</td>
                      <td>
                        {commune.alerts > 0 ? (
                          <span className="badge badge-suspicious" style={{ fontSize: '0.65rem' }}>{commune.alerts}</span>
                        ) : (
                          <span className="badge badge-authentic" style={{ fontSize: '0.65rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ color: '#D4AF37', fontWeight: 600 }}>{commune.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button onClick={() => setTab('map')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <Map size={14} /> Voir la carte
            </button>
          </div>
        </div>

        {/* Flux Dispatch */}
        <div className="spa-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-text-main)', fontSize: '1rem' }}>
              <Radio style={{ color: '#D4AF37' }} size={18} /> Flux Dispatcher Mobile
            </h3>
            <span className="badge badge-authentic" style={{ animation: 'blinkAlert 2s infinite ease', fontSize: '0.65rem' }}>
              <Activity size={10} /> Live Sync
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {dispatchLogs.map((log, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--color-border-light)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-sky-blue)' }}>{log.time}</span>
                  <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--color-border-light)', margin: '0.25rem 0' }}></div>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></div>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-main)' }}>{log.unit}</strong>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: 'var(--color-text-subtle)' }}>{log.activity}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setTab('mobile')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }}>
              <Radio size={14} /> Piloter les unités d'intervention
            </button>
          </div>
        </div>

      </div>

      {/* Graphique recettes */}
      <section className="spa-card accent-card">
        <h3 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-text-main)' }}>
          <TrendingUp className="text-sky" size={20} /> Évolution des Recettes & Enregistrements Nationaux
        </h3>
        <p className="mb-3" style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Variation trimestrielle des contributions du marquage laser national — Exercice 2026.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', height: '160px', alignItems: 'end', padding: '1rem 2rem 0', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
          {[
            { label: 'T1 2026', value: '24.1K $', height: '40px', color: 'var(--color-sky-blue)' },
            { label: 'T2 2026', value: '45.8K $', height: '70px', color: 'var(--color-sky-blue)' },
            { label: 'T3 2026', value: '89.2K $', height: '110px', color: 'var(--color-sky-blue)' },
            { label: 'Actuel (T4)', value: '124.9K $', height: '140px', color: '#D4AF37', glow: true }
          ].map((bar, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: bar.color, fontWeight: 700 }}>{bar.value}</span>
              <div style={{
                width: '100%',
                height: bar.height,
                background: `linear-gradient(to top, rgba(0,0,0,0.1), ${bar.color})`,
                borderRadius: '6px 6px 0 0',
                boxShadow: bar.glow ? `0 0 15px rgba(212,175,55,0.2)` : 'none',
                transition: 'height 0.6s ease'
              }}></div>
              <span style={{ fontSize: '0.68rem', color: idx === 3 ? 'var(--color-text-main)' : 'var(--color-text-light)', fontWeight: idx === 3 ? 700 : 500 }}>{bar.label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
