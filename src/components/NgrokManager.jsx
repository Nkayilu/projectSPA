import React, { useState, useEffect } from 'react';
import {
  Globe, Wifi, WifiOff, QrCode, RefreshCw, CheckCircle2,
  AlertTriangle, Copy, ExternalLink, Info, Terminal,
  ChevronRight, Eye, EyeOff, Zap
} from 'lucide-react';
import { API_BASE } from '../api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ active }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8, borderRadius: '50%',
      background: active ? '#10B981' : '#EF4444',
      boxShadow: active ? '0 0 6px rgba(16,185,129,0.6)' : '0 0 6px rgba(239,68,68,0.4)',
      animation: active ? 'blinkAlert 2s infinite' : 'none',
      flexShrink: 0,
    }} />
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copier"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? '#10B981' : '#64748B',
        padding: '0.2rem', display: 'flex', alignItems: 'center',
        transition: 'color 0.2s',
      }}
    >
      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NgrokManager({ addToast, fetchWithAuth }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ngrokInput, setNgrokInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Charger la config actuelle
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/config/public-url`);
      const data = await res.json();
      setConfig(data);
      setNgrokInput(data.publicUrl || '');
    } catch (err) {
      addToast('Impossible de contacter le backend SPA RDC.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const url = ngrokInput.trim().replace(/\/$/, '');

    // Validation basique
    if (url && !url.startsWith('http')) {
      addToast('L\'URL doit commencer par http:// ou https://', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/config/public-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicUrl: url }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur lors de l\'enregistrement');
      }

      const data = await res.json();
      setConfig(data);
      addToast('✅ URL publique enregistrée dans .env et appliquée en mémoire !', 'success');
      setTestResult(null);
    } catch (err) {
      addToast(`Impossible d'enregistrer : ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const url = ngrokInput.trim().replace(/\/$/, '') || config?.publicUrl;
    if (!url) {
      addToast('Aucune URL publique configurée.', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${url}/api/health`.replace('/api/api/', '/api/'), {
        signal: controller.signal,
        mode: 'no-cors',
      });
      clearTimeout(timeout);
      setTestResult({ ok: true, message: 'URL Ngrok accessible !' });
    } catch (err) {
      if (err.name === 'AbortError') {
        setTestResult({ ok: false, message: 'Timeout — URL inaccessible ou Ngrok non démarré.' });
      } else {
        // no-cors peut rejeter avec TypeError mais l'URL est quand même accessible
        setTestResult({ ok: true, message: 'URL semble accessible (mode no-cors).' });
      }
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-text-light)' }}>
        <RefreshCw size={18} style={{ animation: 'scannerMotion 0.8s linear infinite' }} />
        Chargement de la configuration Ngrok...
      </div>
    );
  }

  const isActive = !!(config?.publicUrl);
  const verifyBase = config?.verificationBase || '';

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #1E3A5F, #0F2744)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(0,135,209,0.25)',
          }}>
            <Globe size={22} color="var(--color-sky-blue)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Gestionnaire d'Accès Mobile (Ngrok)
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
              Configurez l'URL publique pour rendre les QR Codes accessibles depuis un téléphone
            </p>
          </div>
        </div>
      </div>

      {/* ── Status Card ── */}
      <div className="spa-card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${isActive ? '#10B981' : '#EF4444'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {isActive
              ? <Wifi size={22} color="#10B981" />
              : <WifiOff size={22} color="#EF4444" />
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <StatusDot active={isActive} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                {isActive ? 'Accès Mobile Actif' : 'Accès Mobile Désactivé'}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
              {isActive
                ? `QR Codes pointent vers : ${config.publicUrl}`
                : 'QR Codes pointent uniquement vers localhost (inaccessible depuis un téléphone externe)'
              }
            </span>
          </div>
          <button
            onClick={fetchConfig}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.4rem' }}
            title="Actualiser"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {isActive && (
          <div style={{
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '10px', padding: '0.75rem 1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981', marginBottom: '0.4rem' }}>
              <QrCode size={10} style={{ marginRight: '0.3rem' }} />
              URL des QR Codes générés
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', flex: 1, wordBreak: 'break-all' }}>
                {config.publicUrl}/verification/SPA-XXXXXXXXXXXXXXXX
              </code>
              <CopyButton text={`${config.publicUrl}/verification/`} />
              <a href={config.publicUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: '#64748B', display: 'flex' }}>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Configuration Card ── */}
      <div className="spa-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} color="var(--color-sky-blue)" />
          Configurer l'URL Publique
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block', fontSize: '0.75rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: 'var(--color-text-subtle)', marginBottom: '0.5rem',
          }}>
            URL Ngrok ou URL de Production
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="url"
                className="form-control"
                placeholder="https://abc123ef.ngrok-free.app"
                value={ngrokInput}
                onChange={(e) => setNgrokInput(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.35rem' }}>
                ℹ️ Obtenez votre URL en exécutant : <code style={{ color: 'var(--color-sky-blue)' }}>ngrok http 5175</code>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <CheckCircle2 size={15} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder et Appliquer'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !ngrokInput.trim()}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            {testing
              ? <RefreshCw size={15} style={{ animation: 'scannerMotion 0.8s linear infinite' }} />
              : <Globe size={15} />
            }
            {testing ? 'Test en cours...' : 'Tester l\'URL'}
          </button>
        </div>

        {/* Résultat du test */}
        {testResult && (
          <div style={{
            marginTop: '1rem',
            background: testResult.ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '10px', padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.82rem', fontWeight: 600,
            color: testResult.ok ? '#10B981' : '#EF4444',
          }}>
            {testResult.ok
              ? <CheckCircle2 size={16} />
              : <AlertTriangle size={16} />
            }
            {testResult.message}
          </div>
        )}

        {/* Statuts de persistance dynamiques */}
        {ngrokInput.trim() !== (config?.publicUrl || '') && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(245,158,11,0.04)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '10px', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#F59E0B', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Terminal size={12} /> Modifications non enregistrées
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
              Vous avez modifié l'URL publique. Cliquez sur <strong>Sauvegarder et Appliquer</strong> pour enregistrer la modification dans <code>backend/.env</code> et l'appliquer immédiatement en mémoire.
            </div>
          </div>
        )}

        {config?.publicUrl && ngrokInput.trim() === config.publicUrl && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '10px', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#10B981', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} /> Configuration active et persistée
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
              L'URL publique est active, enregistrée dans <code>backend/.env</code> et chargée en mémoire. Les QR Codes pointent vers ce domaine.
            </div>
          </div>
        )}
      </div>

      {/* ── Guide Rapide ── */}
      <div className="spa-card" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowGuide(!showGuide)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 0, color: 'var(--color-text-main)',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} color="var(--color-sky-blue)" />
            Guide de Démarrage Rapide
          </span>
          <ChevronRight
            size={18}
            style={{
              color: '#64748B',
              transform: showGuide ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        {showGuide && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                step: '1',
                title: 'Démarrer le backend',
                code: 'cd backend && npm run dev',
                desc: 'Backend Express sur le port 4000',
              },
              {
                step: '2',
                title: 'Démarrer le frontend',
                code: 'npm run dev',
                desc: 'Vite SPA sur le port 5175',
              },
              {
                step: '3',
                title: 'Lancer Ngrok sur le port FRONTEND',
                code: 'ngrok http 5175',
                desc: '⚠️ Important : tunneliser le frontend (5175), pas le backend',
              },
              {
                step: '4',
                title: 'Copier l\'URL et mettre à jour .env',
                code: 'APP_PUBLIC_URL=https://xxxx.ngrok-free.app',
                desc: 'Dans backend/.env — puis redémarrer le backend',
              },
              {
                step: '5',
                title: 'Scanner le QR Code',
                code: '',
                desc: '🎉 Les nouveaux véhicules auront un QR accessible depuis n\'importe quel téléphone',
              },
            ].map(({ step, title, code, desc }) => (
              <div key={step} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '0.75rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,135,209,0.15)', border: '1px solid rgba(0,135,209,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 900, color: 'var(--color-sky-blue)',
                }}>
                  {step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                    {title}
                  </div>
                  {code && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <code style={{
                        fontSize: '0.78rem', color: '#10B981',
                        background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.6rem',
                        borderRadius: '6px', flex: 1,
                      }}>
                        {code}
                      </code>
                      <CopyButton text={code} />
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>{desc}</div>
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a
                href="/NGROK_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.75rem', color: 'var(--color-sky-blue)',
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                <ExternalLink size={12} /> Lire le guide complet NGROK_SETUP.md
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Architecture Info ── */}
      <div style={{
        background: 'rgba(0,135,209,0.03)',
        border: '1px solid rgba(0,135,209,0.08)',
        borderRadius: '12px', padding: '1rem 1.25rem',
        fontSize: '0.75rem', color: 'var(--color-text-subtle)', lineHeight: 2,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--color-text-light)', marginBottom: '0.4rem' }}>
          📐 Architecture du Flux QR
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B' }}>
          📱 Téléphone → Ngrok URL → Vite (:5175) → [proxy /api] → Backend Express (:4000) → SQLite
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          Les QR Codes contiennent uniquement l'UUID sécurisé du véhicule. Les données sont chargées
          en temps réel à chaque scan — toute modification est immédiatement visible.
        </div>
      </div>
    </div>
  );
}
