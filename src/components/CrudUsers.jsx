import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User, Mail, Shield, Lock, X, ShieldAlert, CheckCircle2, Loader2, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { API_BASE } from '../api';

export default function CrudUsers({ addToast, centers }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedCenters, setSelectedCenters] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const savedUserStr = localStorage.getItem('currentUser');
      const token = savedUserStr ? JSON.parse(savedUserStr).token : '';
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      addToast('Erreur lors du chargement des utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('agent');
    setName('');
    setIsActive(true);
    setSelectedCenters([]);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    resetForm();
    setShowAddEditModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword(''); // On laisse vide par sécurité
    setRole(user.role || 'agent');
    setName(user.name || '');
    setIsActive(user.is_active !== false);
    setSelectedCenters(user.center_ids || []);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  const handleCenterToggle = (centerId) => {
    setSelectedCenters(prev =>
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !name.trim() || (!selectedUser && !password.trim())) {
      addToast('Tous les champs marqués d\'une étoile sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    try {
      const savedUserStr = localStorage.getItem('currentUser');
      const token = savedUserStr ? JSON.parse(savedUserStr).token : '';
      
      const payload = {
        username: username.trim(),
        email: email.trim(),
        role,
        name: name.trim(),
        is_active: isActive,
        center_ids: role === 'agent' ? selectedCenters : []
      };
      
      if (password.trim()) {
        payload.password = password.trim();
      }

      let res;
      if (selectedUser) {
        res = await fetch(`${API_BASE}/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde');

      addToast(selectedUser ? 'Utilisateur modifié avec succès.' : 'Utilisateur créé avec succès.', 'success');
      setShowAddEditModal(false);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Erreur d\'enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const savedUserStr = localStorage.getItem('currentUser');
      const token = savedUserStr ? JSON.parse(savedUserStr).token : '';
      const res = await fetch(`${API_BASE}/api/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de suppression');

      addToast(`Utilisateur "${deleteTarget.username}" supprimé.`, 'success');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Impossible de supprimer cet utilisateur.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const savedUserStr = localStorage.getItem('currentUser');
      const token = savedUserStr ? JSON.parse(savedUserStr).token : '';
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        is_active: !user.is_active,
        center_ids: user.center_ids
      };

      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de statut');

      addToast(`Compte de ${user.username} ${!user.is_active ? 'activé' : 'désactivé'}.`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Erreur lors de la modification du statut.', 'error');
    }
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestion des Utilisateurs</h2>
          <p className="page-subtitle">Créer et administrer les comptes d'accès officiels de l'État RDC et affecter les agents aux stations de gravage.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Ajouter un Utilisateur
        </button>
      </div>

      {/* Search */}
      <div className="search-bar-wrapper">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Rechercher par nom, e-mail ou identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} disabled={loading}>
          {loading ? <Loader2 size={14} className="spin" /> : 'Actualiser'}
        </button>
        <div className="search-meta">{filtered.length} utilisateur(s) trouvé(s)</div>
      </div>

      {/* List / Grid */}
      {loading && users.length === 0 ? (
        <div className="empty-state">
          <Loader2 size={40} className="spin" opacity={0.3} />
          <p>Chargement des utilisateurs en cours...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <User size={40} opacity={0.3} />
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((u) => (
            <div key={u.id} className={`entity-card ${!u.is_active ? 'deactivated-card' : ''}`} style={{ opacity: u.is_active ? 1 : 0.75 }}>
              <div className="entity-card-header">
                <div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-suspicious' : u.role === 'police' ? 'badge-pending' : 'badge-authentic'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    <Shield size={10} style={{ marginRight: '3px', display: 'inline', verticalAlign: 'middle' }} />
                    {u.role === 'admin' ? 'Directeur / Admin' : u.role === 'police' ? 'Officier PNC' : 'Agent SPA'}
                  </span>
                  <h3 className="entity-card-title" style={{ marginTop: '0.25rem' }}>{u.name}</h3>
                </div>
                <div className="entity-actions">
                  <button onClick={() => openEditModal(u)} className="btn-icon btn-icon-edit" title="Modifier">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => openDeleteModal(u)} className="btn-icon btn-icon-delete" title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Identifiant :</strong> <code>{u.username}</code></div>
                <div><strong>E-mail :</strong> {u.email}</div>
                
                {u.role === 'agent' && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong>Stations affectées ({u.center_ids?.length || 0}) :</strong>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {u.center_ids && u.center_ids.length > 0 ? (
                        u.center_ids.map(cid => {
                          const centerObj = centers.find(c => c.id === cid);
                          return (
                            <span key={cid} className="badge badge-authentic" style={{ fontSize: '0.65rem', background: 'rgba(0,135,209,0.06)', border: '1px solid rgba(0,135,209,0.2)', color: 'var(--color-sky-blue)' }}>
                              <MapPin size={8} style={{ marginRight: '2px' }} /> {centerObj ? centerObj.name.replace('Centre Agréé SPA - ', '').replace('Centre National SPA - ', '') : cid}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--color-crimson)' }}>Aucune station (accès restreint)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="entity-card-footer" style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${u.is_active ? 'badge-authentic' : 'badge-suspicious'}`}>
                  {u.is_active ? 'Compte Actif' : 'Compte Désactivé'}
                </span>
                <button
                  onClick={() => toggleUserStatus(u)}
                  className="btn"
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'transparent',
                    border: '1px solid var(--color-border-light)',
                    color: 'var(--color-text-light)',
                    borderRadius: '6px'
                  }}
                  title={u.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                >
                  {u.is_active ? <ToggleRight size={18} className="text-emerald" /> : <ToggleLeft size={18} />}
                  {u.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL AJOUTER / MODIFIER ===== */}
      {showAddEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content medium-modal" style={{ animation: 'scaleInAlert 0.3s ease-out' }}>
            <div className="modal-header">
              <h3>
                <User size={20} style={{ color: 'var(--color-sky-blue)' }} />
                {selectedUser ? 'Modifier l\'Utilisateur' : 'Créer un Nouvel Utilisateur'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body form-grid">
                
                <div className="form-group full-width">
                  <label className="form-label">Nom Complet *</label>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="Ex: Diallo Aimé Christian"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom d'Utilisateur / Identifiant *</label>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="Ex: adiallo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ textTransform: 'lowercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse E-mail *</label>
                  <input
                    required
                    type="email"
                    className="form-control"
                    placeholder="Ex: aime.diallo@spa.cd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mot de passe {selectedUser && '(Laisser vide pour ne pas modifier)'} *</label>
                  <input
                    required={!selectedUser}
                    type="password"
                    className="form-control"
                    placeholder={selectedUser ? '••••••••' : 'Saisir le mot de passe'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Administrateur</option>
                    <option value="agent">Agent Technique SPA</option>
                    <option value="police">Officier Police PNC</option>
                  </select>
                </div>

                {role === 'agent' && (
                  <div className="form-group full-width" style={{ background: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: '10px', marginTop: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <MapPin size={16} className="text-sky" /> Affectation aux Stations de Gravage *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      {centers && centers.length > 0 ? (
                        centers.map(center => (
                          <label key={center.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', padding: '0.25rem 0', color: 'var(--color-text-main)' }}>
                            <input
                              type="checkbox"
                              checked={selectedCenters.includes(center.id)}
                              onChange={() => handleCenterToggle(center.id)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span>{center.name} ({center.region})</span>
                          </label>
                        ))
                      ) : (
                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-light)' }}>Aucune station de gravage disponible en base. Créez-en une d'abord.</p>
                      )}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>L'agent ne verra et ne gérera que les dossiers liés aux stations sélectionnées.</p>
                  </div>
                )}

                <div className="form-group full-width" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveCheck" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    Activer le compte d'accès (Autorisé à se connecter)
                  </label>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddEditModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> Enregistrement...</> : (selectedUser ? 'Sauvegarder les modifications' : 'Créer l\'utilisateur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL SUPPRIMER ===== */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3 style={{ color: 'var(--color-crimson)' }}>Supprimer l'Utilisateur</h3>
              <button onClick={() => setShowDeleteModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-warning-box">
                <ShieldAlert size={24} style={{ color: 'var(--color-crimson)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'var(--color-crimson)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Action Irréversible</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
                    Le compte <strong>{deleteTarget.username}</strong> ({deleteTarget.name}) sera supprimé définitivement du système. Ses logs d'audit seront conservés pour traçabilité.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger" disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
