import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginView({ onLogin, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        onLogin(data);
        addToast(`Connexion réussie en tant que ${data.name}`, 'success');
      } else {
        setError(data.error || 'Identifiants incorrects. Veuillez réessayer.');
        addToast('Échec de la connexion', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de communication avec le serveur d\'authentification.');
      addToast('Échec de la connexion (réseau)', 'error');
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="flex-center" style={{ minHeight: '60vh', padding: '2rem 1rem' }}>
      <div className="spa-card accent-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
        
        {/* Header / Crest */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-emblem" style={{ margin: '0 auto 1rem', width: '56px', height: '56px', fontSize: '1.6rem' }}>
            <span>🛡️</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Portail Sécurisé SPA RDC
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            Accès réservé aux personnels autorisés de l'État
          </p>
        </div>

        {error && (
          <div className="delete-warning-box" style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'rgba(206, 16, 46, 0.05)', border: '1px solid rgba(206, 16, 46, 0.2)', borderRadius: '8px' }}>
            <AlertTriangle size={16} className="text-crimson" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-crimson)', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label><Mail size={14} /> Adresse E-mail Professionnelle</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="email"
                className="form-control"
                placeholder="Ex: agent@spa.cd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label><Lock size={14} /> Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Saisir votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            Se connecter
          </button>
        </form>

        {/* Quick Helper Badges */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem', textAlign: 'left' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
            Comptes de test (cliquer pour remplir) :
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => fillCredentials('admin@spa.cd', 'admin')}
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', justifyContent: 'space-between', display: 'flex', width: '100%', borderRadius: '6px' }}
            >
              <span>Administrateur RDC</span>
              <code style={{ fontSize: '0.7rem', padding: '0 4px', background: '#E2E8F0' }}>admin</code>
            </button>
            <button 
              type="button" 
              onClick={() => fillCredentials('agent@spa.cd', 'agent')}
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', justifyContent: 'space-between', display: 'flex', width: '100%', borderRadius: '6px' }}
            >
              <span>Agent Technique SPA</span>
              <code style={{ fontSize: '0.7rem', padding: '0 4px', background: '#E2E8F0' }}>agent</code>
            </button>
            <button 
              type="button" 
              onClick={() => fillCredentials('police@spa.cd', 'police')}
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', justifyContent: 'space-between', display: 'flex', width: '100%', borderRadius: '6px' }}
            >
              <span>Officier Police PNC</span>
              <code style={{ fontSize: '0.7rem', padding: '0 4px', background: '#E2E8F0' }}>police</code>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
