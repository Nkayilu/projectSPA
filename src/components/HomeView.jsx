import React from 'react';
import { ShieldCheck, Search, PlusCircle, QrCode, Sparkles, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HomeView({ setTab }) {
  return (
    <div className="home-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      {/* Hero Section */}
      <section className="hero-section spa-card accent-card mb-3" style={{ background: 'linear-gradient(135deg, var(--color-navy-800) 0%, rgba(4, 10, 24, 0.9) 100%)', border: '1px solid var(--color-navy-700)' }}>
        <div className="grid-2 align-center" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div className="hero-text-content" style={{ textAlign: 'left' }}>
            <div className="badge badge-authentic mb-2" style={{ backgroundColor: 'rgba(0, 135, 209, 0.15)', color: 'var(--color-sky-blue)', borderColor: 'rgba(0, 135, 209, 0.3)' }}>
              <ShieldCheck size={12} /> SECURE PARTS PROTOCOL
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 1.2rem + 3.5vw, 3.5rem)', color: '#ffffff', lineHeight: '1.1', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontWeight: 800 }}>
              Rendez les pièces volées <span style={{ color: 'var(--color-sky-blue)' }}>inutilisables</span>.
            </h1>
            <p className="lead mb-3" style={{ fontSize: '1.05rem', color: '#94A3B8', marginBottom: '2rem' }}>
              SPA RDC est la plateforme nationale congolaise de traçabilité et de sécurisation des véhicules par marquage laser et identification numérique. Protégez votre véhicule et authentifiez vos pièces en temps réel.
            </p>
            
            <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setTab('verify')} className="btn btn-primary" style={{ padding: '0.9rem 1.8rem' }}>
                <Search size={18} /> Vérifier une pièce
              </button>
              <button onClick={() => setTab('register')} className="btn btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                <PlusCircle size={18} /> Enregistrer mon véhicule
              </button>
            </div>
          </div>

          {/* Hero Right Visuals (Laser / QR Code Simulation) */}
          <div className="hero-visual" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* Visual Container */}
            <div style={{ width: '100%', maxWidth: '420px', background: 'radial-gradient(circle, rgba(0, 135, 209, 0.15) 0%, transparent 70%)', padding: '1rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(6, 11, 25, 0.5)', position: 'relative', overflow: 'hidden' }}>
              
              {/* Animated laser line */}
              <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #0087D1, #FCD116, #CE102E, transparent)', boxShadow: '0 0 15px #0087D1', animation: 'scannerMotion 4s infinite ease-in-out', zIndex: 10 }}></div>
              
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                {/* SVG Car Contour with Holographic Circles */}
                <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg viewBox="0 0 120 60" style={{ width: '100%', height: '100%', stroke: 'rgba(0, 135, 209, 0.4)', fill: 'none', strokeWidth: '0.75', filter: 'drop-shadow(0 0 8px rgba(0, 135, 209, 0.3))' }}>
                    {/* Stylized Modern Car Path */}
                    <path d="M5,42 L12,42 L16,33 L32,32 L46,18 L76,18 L94,32 L108,34 L114,40 L115,45 L106,45 C106,40 98,40 98,45 L80,45 C80,40 72,40 72,45 L40,45 C40,40 32,40 32,45 L15,45 C15,40 7,40 7,45 L5,45 Z" />
                    <circle cx="11" cy="45" r="4.5" stroke="var(--color-sky-blue)" strokeWidth="1" />
                    <circle cx="36" cy="45" r="4.5" stroke="var(--color-sky-blue)" strokeWidth="1" />
                    <circle cx="76" cy="45" r="4.5" stroke="var(--color-sky-blue)" strokeWidth="1" />
                    <circle cx="102" cy="45" r="4.5" stroke="var(--color-sky-blue)" strokeWidth="1" />
                    {/* Laser Target Reticle overlay */}
                    <circle cx="58" cy="28" r="16" stroke="rgba(252, 209, 22, 0.4)" strokeWidth="0.5" strokeDasharray="3 2" />
                    <line x1="58" y1="8" x2="58" y2="48" stroke="rgba(252, 209, 22, 0.2)" strokeWidth="0.5" />
                    <line x1="38" y1="28" x2="78" y2="28" stroke="rgba(252, 209, 22, 0.2)" strokeWidth="0.5" />
                  </svg>
                  
                  {/* Holographic Glowing Pulse Points representing Engraved Parts */}
                  <div className="squad-pulse" style={{ position: 'absolute', top: '48%', left: '30%', width: '10px', height: '10px', backgroundColor: 'var(--color-sky-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-sky-blue)', animation: 'pulseCrimson 1.8s infinite' }}></div>
                  <div className="squad-pulse" style={{ position: 'absolute', top: '30%', left: '50%', width: '10px', height: '10px', backgroundColor: 'var(--color-gold)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-gold)', animation: 'pulseCrimson 2.2s infinite' }}></div>
                  <div className="squad-pulse" style={{ position: 'absolute', top: '55%', left: '80%', width: '10px', height: '10px', backgroundColor: 'var(--color-sky-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-sky-blue)', animation: 'pulseCrimson 1.5s infinite' }}></div>
                </div>

                {/* Laser engraving concept tag */}
                <div className="spa-card" style={{ padding: '0.75rem', backgroundColor: 'rgba(4, 10, 24, 0.7)', border: '1px solid var(--color-navy-700)', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                  <QrCode className="text-sky" size={32} />
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Micro-Engraving Laser & QR</h4>
                    <p style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Un code QR inviolable est gravé sur le châssis, les vitres, les phares et le moteur.</p>
                  </div>
                </div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="dashboard-grid mb-3">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-sky-blue)' }}>
          <div className="stat-info">
            <span className="stat-label">Pièces Sécurisées</span>
            <span className="stat-value" style={{ fontFamily: 'var(--font-display)' }}>184,930</span>
            <span className="stat-change up"><CheckCircle2 size={12} /> Traçabilité 100%</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-sky-blue)' }}>
            <Cpu size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-gold)' }}>
          <div className="stat-info">
            <span className="stat-label">Taux de Dissuasion</span>
            <span className="stat-value" style={{ fontFamily: 'var(--font-display)' }}>92.4%</span>
            <span className="stat-change up"><Sparkles size={12} /> Baisse drastique des vols</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-gold)', backgroundColor: 'rgba(252, 209, 22, 0.1)' }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-crimson)' }}>
          <div className="stat-info">
            <span className="stat-label">Alertes Fraudes Actives</span>
            <span className="stat-value" style={{ fontFamily: 'var(--font-display)' }}>14</span>
            <span className="stat-change down"><ShieldAlert size={12} /> Interventions PNC en cours</span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-crimson)', backgroundColor: 'rgba(206, 16, 46, 0.1)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>
      </section>

      {/* Main Core Columns - Features & Explanations */}
      <div className="grid-3 mb-3">
        
        {/* Core pillar 1 */}
        <div className="spa-card">
          <div className="stat-icon-wrapper mb-2" style={{ color: 'var(--color-sky-blue)' }}>
            <Cpu size={20} />
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 700 }}>1. Marquage Laser Inviolable</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Des identifiants uniques sont gravés chimiquement ou au laser haute puissance sur les éléments clés du véhicule (rétroviseurs, jantes, pots catalytiques).
          </p>
        </div>

        {/* Core pillar 2 */}
        <div className="spa-card">
          <div className="stat-icon-wrapper mb-2" style={{ color: 'var(--color-gold)', backgroundColor: 'rgba(252, 209, 22, 0.1)' }}>
            <QrCode size={20} />
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 700 }}>2. Identité Numérique & QR</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Chaque marquage génère un certificat numérique d'immatriculation décentralisé sous forme de code QR cryptographique stocké dans notre registre centralisé.
          </p>
        </div>

        {/* Core pillar 3 */}
        <div className="spa-card">
          <div className="stat-icon-wrapper mb-2" style={{ color: 'var(--color-crimson)', backgroundColor: 'rgba(206, 16, 46, 0.1)' }}>
            <ShieldAlert size={20} />
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 700 }}>3. Protection Actives & Police</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Si une pièce est volée et scannée par un acheteur ou la police routière, elle est instantanément identifiée. Les receleurs ne peuvent plus revendre de pièces marquées.
          </p>
        </div>

      </div>

      {/* Center & Info Section */}
      <section className="spa-card accent-card mb-3" style={{ padding: '2.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
          Comment sécuriser votre véhicule en RDC ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', border: '1px solid var(--color-border-light)', color: 'var(--color-sky-blue)', fontWeight: 800, flexShrink: 0 }}>1</div>
            <div>
              <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Créez le profil</h4>
              <p style={{ fontSize: '0.8rem' }}>Remplissez le formulaire officiel en ligne avec votre carte rose, vignette et photos du véhicule.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', border: '1px solid var(--color-border-light)', color: 'var(--color-sky-blue)', fontWeight: 800, flexShrink: 0 }}>2</div>
            <div>
              <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Rendez-vous en Centre</h4>
              <p style={{ fontSize: '0.8rem' }}>Présentez votre véhicule dans un centre agréé SPA (Kinshasa, Goma, Lubumbashi) pour le gravage laser physique.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', border: '1px solid var(--color-border-light)', color: 'var(--color-sky-blue)', fontWeight: 800, flexShrink: 0 }}>3</div>
            <div>
              <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Recevez votre Certificat</h4>
              <p style={{ fontSize: '0.8rem' }}>Votre certificat numérique sécurisé de traçabilité est actif et disponible pour les contrôles de police.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
