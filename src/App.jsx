import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import HomeView from './components/HomeView';
import VerificationView from './components/VerificationView';
import LoginView from './components/LoginView';
import AdminDashboard from './components/AdminDashboard';
import CrudVehicles from './components/CrudVehicles';
import CrudCenters from './components/CrudCenters';
import CrudSquads from './components/CrudSquads';
import InteractiveMap from './components/InteractiveMap';
import PoliceConsole from './components/PoliceConsole';
import RegistrationView from './components/RegistrationView';
import CrudUsers from './components/CrudUsers';
import PublicVerification from './components/PublicVerification';
import NgrokManager from './components/NgrokManager';

import { 
  ShieldCheck, Home, Search, PlusCircle, LayoutDashboard, Radio,
  Map, ShieldAlert, ExternalLink, X, Lock, LogOut, MapPin, List,
  AlertCircle, CheckCircle2, Settings, Info, Users, Globe
} from 'lucide-react';

// API_BASE est défini dans src/api.js et pointe vers le backend Render en production
// et vers localhost:4000 en développement local (via .env.local).

export default function App() {
  const [tab, setTab] = useState('home');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [verifyToken, setVerifyToken] = useState('');

  // Mode vérification publique via QR Code scan (/verification/:token)
  const [publicQrToken, setPublicQrToken] = useState(null);

  // ====================================================================
  // Toast System
  // ====================================================================
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ====================================================================
  // Helper de requêtes sécurisées
  // ====================================================================
  const fetchWithAuth = async (url, options = {}) => {
    const savedUserStr = localStorage.getItem('currentUser');
    const token = savedUserStr ? JSON.parse(savedUserStr).token : '';
    
    const headers = {
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      if (res.status === 401) {
        handleLogout();
        addToast('Votre session a expiré ou est invalide. Veuillez vous reconnecter.', 'error');
        throw new Error('Session expirée');
      }

      return res;
    } catch (err) {
      if (err.message === 'Session expirée') throw err;
      throw new Error(err.message || 'Erreur réseau ou serveur indisponible');
    }
  };

  // ====================================================================
  // VEHICLES — API SQLite
  // ====================================================================
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/vehicles`);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      if (err.message !== 'Session expirée') {
        addToast('Impossible de charger le registre des véhicules.', 'error');
      }
    } finally {
      setLoadingVehicles(false);
    }
  };

  // ====================================================================
  // USERS — API SQLite (Admin only)
  // ====================================================================
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users`);
      if (!res.ok) return; // Non-admins will get 403, silently ignore
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const addVehicle = async (vehicle) => {
    const res = await fetchWithAuth(`${API_BASE}/api/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur création véhicule');
    await fetchVehicles();
    return data;
  };

  const editVehicle = async (updated) => {
    const res = await fetchWithAuth(`${API_BASE}/api/vehicles/${updated.plate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur mise à jour véhicule');
    await fetchVehicles();
    return data;
  };

  const deleteVehicle = async (plate) => {
    const res = await fetchWithAuth(`${API_BASE}/api/vehicles/${plate}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur suppression véhicule');
    await fetchVehicles();
    return data;
  };

  // ====================================================================
  // CENTERS — API SQLite (plus local state)
  // ====================================================================
  const [centers, setCenters] = useState([]);

  const fetchCenters = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/centers`);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      setCenters(data);
    } catch (err) {
      console.error('Fetch centers error:', err);
    }
  };

  const addCenter = async (center) => {
    const res = await fetchWithAuth(`${API_BASE}/api/centers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(center)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur création centre');
    await fetchCenters();
    return data;
  };

  const editCenter = async (updated) => {
    const res = await fetchWithAuth(`${API_BASE}/api/centers/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur mise à jour centre');
    await fetchCenters();
    return data;
  };

  const deleteCenter = async (id) => {
    const res = await fetchWithAuth(`${API_BASE}/api/centers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur suppression centre');
    await fetchCenters();
    return data;
  };

  // ====================================================================
  // SQUADS — API SQLite (plus local state)
  // ====================================================================
  const [squads, setSquads] = useState([]);

  const fetchSquads = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/squads`);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      setSquads(data);
    } catch (err) {
      console.error('Fetch squads error:', err);
    }
  };

  const addSquad = async (squad) => {
    const res = await fetchWithAuth(`${API_BASE}/api/squads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(squad)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur création patrouille');
    await fetchSquads();
    return data;
  };

  const editSquad = async (updated) => {
    const res = await fetchWithAuth(`${API_BASE}/api/squads/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur mise à jour patrouille');
    await fetchSquads();
    return data;
  };

  const deleteSquad = async (id) => {
    const res = await fetchWithAuth(`${API_BASE}/api/squads/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur suppression patrouille');
    await fetchSquads();
    return data;
  };

  // ====================================================================
  // Init au chargement & Restauration session
  // ====================================================================
  useEffect(() => {
    window.logApp('Montage du composant App.jsx');
    const savedUserStr = localStorage.getItem('currentUser');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        window.logApp('Restauration utilisateur trouvé dans localStorage', parsed.username);
        setCurrentUser(parsed);
      } catch (err) {
        window.logApp('Erreur de parsing de currentUser', err.message);
        localStorage.removeItem('currentUser');
      }
    } else {
      window.logApp('Aucun utilisateur connecté trouvé dans localStorage');
    }

    // Détecter une URL de vérification publique via QR Code
    // Format : /verification/<token>  (généré par Ngrok / production)
    const pathname = window.location.pathname;
    window.logApp('Détection route publique - pathname: ' + pathname);
    const verificationMatch = pathname.match(/^\/verification\/(.+)$/);
    if (verificationMatch) {
      const token = decodeURIComponent(verificationMatch[1]);
      window.logApp('Match route verification avec token', token);
      setPublicQrToken(token);
      return; // Ne pas traiter d'autres paramètres URL
    } else {
      window.logApp('Chemin standard, pas de match /verification/:token');
    }

    // Gérer le paramètre QR token dans l'URL (mode legacy : /?tab=verify&token=...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tabParam = params.get('tab');
    window.logApp('URL Params', { token, tabParam });
    if (token) {
      window.logApp('Paramètre token trouvé dans l\'URL (mode legacy)', token);
      setTab('verify');
      setVerifyToken(token);
    } else if (tabParam) {
      window.logApp('Paramètre tab trouvé dans l\'URL', tabParam);
      setTab(tabParam);
    }
  }, []);

  // Charger les données quand l'utilisateur change (login/logout/restauration)
  useEffect(() => {
    if (currentUser) {
      fetchVehicles();
      fetchCenters();
      fetchSquads();
      if (currentUser.role === 'admin') fetchUsers();
    } else {
      setVehicles([]);
      setCenters([]);
      setSquads([]);
      setUsers([]);
    }
  }, [currentUser]);

  // ====================================================================
  // Auth Handlers
  // ====================================================================
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'police') setAdminTab('police');
    else if (user.role === 'agent') setAdminTab('registration');
    else setAdminTab('dashboard');
    addToast(`Bienvenue, ${user.name} !`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setTab('home');
    addToast('Déconnexion effectuée avec succès.', 'info');
  };

  // ====================================================================
  // Toast Icon
  // ====================================================================
  const ToastIcon = ({ type }) => {
    if (type === 'success') return <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />;
    if (type === 'error') return <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />;
    if (type === 'warning') return <AlertCircle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />;
    return <Info size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />;
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  // Mode vérification publique : QR Code scanné depuis un téléphone via Ngrok
  // L'URL est /verification/<token> — affichage sans login requis
  if (publicQrToken) {
    window.logApp('Rendu: Mode PublicVerification (QR scanné) avec le token', publicQrToken);
    return (
      <div className="app-container" style={{ minHeight: '100vh' }}>
        <div className="national-stripe" />
        <PublicVerification token={publicQrToken} />
      </div>
    );
  }

  window.logApp('Rendu: Mode Principal. Utilisateur: ' + (currentUser ? currentUser.name : 'anonyme') + ', Tab: ' + tab);

  return (
    <div className="app-container">
      {/* Congo Flag Stripe */}
      <div className="national-stripe"></div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div className="toast-content">
              <ToastIcon type={t.type} />
              <span className="toast-message">{t.message}</span>
            </div>
            <button onClick={() => removeToast(t.id)} className="toast-close">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {currentUser ? (
        /* ================================================================
         * ESPACE PRIVÉ AUTHENTIFIÉ
         * ================================================================ */
        <div className="private-workspace">

          {/* Sidebar */}
          <aside className="workspace-sidebar">
            <div className="sidebar-header">
              <div className="brand-block" style={{ pointerEvents: 'none' }}>
                <div className="brand-logo-emblem"><span>🛡️</span></div>
                <div className="brand-text">
                  <span className="brand-acronym">SPA WORKSPACE</span>
                  <span className="brand-subtitle" style={{ fontSize: '0.65rem' }}>Portail Sécurisé RDC</span>
                </div>
              </div>
            </div>

            <div className="sidebar-profile">
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>IDENTIFIÉ :</span>
              <span className="profile-email">{currentUser.name}</span>
              <span className={`profile-role-badge ${currentUser.role}`}>
                {currentUser.role === 'admin' && 'Administrateur'}
                {currentUser.role === 'agent' && 'Agent SPA'}
                {currentUser.role === 'police' && 'Officier PNC'}
              </span>
            </div>

            <ul className="sidebar-nav">
              {/* ADMIN */}
              {currentUser.role === 'admin' && (<>
                <li><button onClick={() => setAdminTab('dashboard')} className={`sidebar-link ${adminTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={16} /> Vue Générale</button></li>
                <li><button onClick={() => setAdminTab('registration')} className={`sidebar-link ${adminTab === 'registration' ? 'active' : ''}`}><PlusCircle size={16} /> Nouveau Gravage</button></li>
                <li><button onClick={() => setAdminTab('vehicles')} className={`sidebar-link ${adminTab === 'vehicles' ? 'active' : ''}`}><List size={16} /> Registre Véhicules</button></li>
                <li><button onClick={() => setAdminTab('centers')} className={`sidebar-link ${adminTab === 'centers' ? 'active' : ''}`}><MapPin size={16} /> Gérer les Centres</button></li>
                <li><button onClick={() => setAdminTab('squads')} className={`sidebar-link ${adminTab === 'squads' ? 'active' : ''}`}><Radio size={16} /> Gérer les Patrouilles</button></li>
                <li><button onClick={() => setAdminTab('map')} className={`sidebar-link ${adminTab === 'map' ? 'active' : ''}`}><Map size={16} /> Carte de Surveillance</button></li>
                <li><button onClick={() => { setAdminTab('users'); fetchUsers(); }} className={`sidebar-link ${adminTab === 'users' ? 'active' : ''}`}><Users size={16} /> Gérer les Utilisateurs</button></li>
                <li><button onClick={() => setAdminTab('ngrok')} className={`sidebar-link ${adminTab === 'ngrok' ? 'active' : ''}`}><Globe size={16} /> Accès Mobile (QR)</button></li>
              </>)}

              {/* AGENT */}
              {currentUser.role === 'agent' && (<>
                <li><button onClick={() => setAdminTab('registration')} className={`sidebar-link ${adminTab === 'registration' ? 'active' : ''}`}><PlusCircle size={16} /> Nouveau Gravage</button></li>
                <li><button onClick={() => setAdminTab('vehicles')} className={`sidebar-link ${adminTab === 'vehicles' ? 'active' : ''}`}><List size={16} /> Enregistrements</button></li>
                <li><button onClick={() => setAdminTab('centers')} className={`sidebar-link ${adminTab === 'centers' ? 'active' : ''}`}><MapPin size={16} /> Stations de Gravage</button></li>
                <li><button onClick={() => setAdminTab('map')} className={`sidebar-link ${adminTab === 'map' ? 'active' : ''}`}><Map size={16} /> Carte Nationale</button></li>
              </>)}

              {/* POLICE */}
              {currentUser.role === 'police' && (<>
                <li><button onClick={() => setAdminTab('police')} className={`sidebar-link ${adminTab === 'police' ? 'active' : ''}`}><ShieldAlert size={16} /> Console Intercept PNC</button></li>
                <li><button onClick={() => setAdminTab('map')} className={`sidebar-link ${adminTab === 'map' ? 'active' : ''}`}><Map size={16} /> Carte de Surveillance</button></li>
              </>)}

              <li className="sidebar-divider"></li>
              <li><button onClick={handleLogout} className="sidebar-link logout-btn"><LogOut size={16} /> Déconnexion</button></li>
            </ul>
          </aside>

          {/* Main workspace */}
          <div className="workspace-body">
            <div className="workspace-top-bar">
              <span className="top-bar-title">
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO – MINISTÈRE DE L'INTÉRIEUR
              </span>
              <div className="top-bar-actions">
                <span className="badge badge-authentic" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }}>
                  <ShieldCheck size={12} /> PORTAIL SÉCURISÉ ACTIF
                </span>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {adminTab === 'dashboard' && currentUser.role === 'admin' && (
                <AdminDashboard vehicles={vehicles} setTab={(t) => {
                  if (t === 'map') setAdminTab('map');
                  if (t === 'mobile') setAdminTab('squads');
                }} />
              )}

              {adminTab === 'registration' && (
                <div style={{ padding: '2rem' }}>
                  <RegistrationView
                    addVehicle={addVehicle}
                    addToast={addToast}
                    centers={centers}
                    currentUser={currentUser}
                  />
                </div>
              )}

              {adminTab === 'vehicles' && (
                <CrudVehicles
                  vehicles={vehicles}
                  addVehicle={addVehicle}
                  onEditVehicle={editVehicle}
                  onDeleteVehicle={deleteVehicle}
                  addToast={addToast}
                  loading={loadingVehicles}
                  currentUser={currentUser}
                />
              )}

              {adminTab === 'centers' && (
                <CrudCenters
                  centers={centers}
                  addCenter={addCenter}
                  onEditCenter={editCenter}
                  onDeleteCenter={deleteCenter}
                  addToast={addToast}
                  currentUser={currentUser}
                />
              )}

              {adminTab === 'users' && currentUser.role === 'admin' && (
                <CrudUsers
                  addToast={addToast}
                  centers={centers}
                />
              )}

              {adminTab === 'squads' && (
                <CrudSquads
                  squads={squads}
                  addSquad={addSquad}
                  onEditSquad={editSquad}
                  onDeleteSquad={deleteSquad}
                  addToast={addToast}
                />
              )}

              {adminTab === 'map' && (
                <InteractiveMap centers={centers} squads={squads} />
              )}

              {adminTab === 'police' && (
                <PoliceConsole vehicles={vehicles} />
              )}

              {adminTab === 'ngrok' && currentUser.role === 'admin' && (
                <NgrokManager addToast={addToast} fetchWithAuth={fetchWithAuth} />
              )}
            </div>

            <footer className="workspace-footer">
              Copyright © 2026 SPA RDC – Smart Parts Authentication. Autorisation Spéciale Requise.
            </footer>
          </div>
        </div>

      ) : (
        /* ================================================================
         * ESPACE PUBLIC
         * ================================================================ */
        <>
          <header className="main-header">
            <div className="header-content">
              <a href="#" onClick={(e) => { e.preventDefault(); setTab('home'); }} className="brand-block">
                <div className="brand-logo-emblem"><span>🦁</span></div>
                <div className="brand-text">
                  <span className="brand-acronym">SPA RDC</span>
                  <span className="brand-subtitle">Sécurité Pièces Auto</span>
                  <span className="brand-authority">PRÉSIDENCE DE LA RÉPUBLIQUE</span>
                </div>
              </a>

              <nav style={{ display: 'flex', alignItems: 'center' }}>
                <ul className="nav-menu">
                  <li>
                    <button onClick={() => setTab('home')} className={`nav-btn ${tab === 'home' ? 'active' : ''}`}>
                      <Home size={14} /> Accueil
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setTab('verify')} className={`nav-btn ${tab === 'verify' ? 'active' : ''}`}>
                      <Search size={14} /> Vérification
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setTab('login')} className={`nav-btn nav-btn-police ${tab === 'login' ? 'active' : ''}`}>
                      <Lock size={14} /> Espace Professionnel
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {tab === 'home' && <HomeView setTab={setTab} />}
            {tab === 'verify' && (
              <VerificationView
                vehicles={vehicles}
                autoToken={verifyToken}
                clearAutoToken={() => setVerifyToken('')}
              />
            )}
            {tab === 'login' && <LoginView onLogin={handleLogin} addToast={addToast} />}
          </main>

          <footer className="main-footer">
            <div className="footer-grid">
              <div>
                <div className="footer-brand">
                  <span style={{ fontSize: '1.5rem' }}>🦁</span>
                  <strong>SPA RDC</strong>
                </div>
                <p className="footer-desc">
                  Plateforme nationale cryptographique d'authentification et de traçabilité des pièces auto en République Démocratique du Congo.
                </p>
              </div>
              <div>
                <h4 className="footer-heading">Liens Officiels</h4>
                <ul className="footer-links">
                  <li><a href="https://journalofficiel.cd" target="_blank" rel="noopener noreferrer">Journal Officiel RDC <ExternalLink size={12} /></a></li>
                  <li><a href="https://presidence.cd" target="_blank" rel="noopener noreferrer">Présidence de la République <ExternalLink size={12} /></a></li>
                  <li><a href="#">Ministère de l'Intérieur & Sécurité</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Sécurité & Chiffrement</h4>
                <p className="footer-desc">
                  Certifié conforme aux protocoles de traçabilité interinstitutionnelle de la Police Nationale Congolaise (PNC).
                </p>
                <span className="badge badge-authentic" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-flex' }}>
                  <ShieldCheck size={10} /> SECURE CRYPTO RDC
                </span>
              </div>
            </div>
            <div className="footer-copy">
              Copyright © 2026 SPA RDC – Smart Parts Authentication. Tous droits réservés.
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
