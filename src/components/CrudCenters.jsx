import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, X, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

export default function CrudCenters({ centers, addCenter, onEditCenter, onDeleteCenter, addToast, currentUser }) {
  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [desc, setDesc] = useState('');
  const [staff, setStaff] = useState('');
  const [status, setStatus] = useState('Ouvert (08h - 18h)');
  const [xPos, setXPos] = useState(150);
  const [yPos, setYPos] = useState(150);

  const resetForm = () => {
    setName(''); setRegion(''); setDesc('');
    setStaff(''); setStatus('Ouvert (08h - 18h)');
    setXPos(150); setYPos(150);
  };

  const openAddModal = () => {
    setSelectedCenter(null);
    resetForm();
    setShowAddEditModal(true);
  };

  const openEditModal = (center) => {
    setSelectedCenter(center);
    setName(center.name || '');
    setRegion(center.region || '');
    setDesc(center.desc || center.description || '');
    setStaff(center.staff || '');
    setStatus(center.status || 'Ouvert (08h - 18h)');
    setXPos(center.x || 150);
    setYPos(center.y || 150);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (center) => {
    setDeleteTarget(center);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !region.trim()) {
      addToast('Le nom et la région du centre sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: selectedCenter?.id,
        name: name.trim(),
        region: region.trim(),
        desc: desc.trim(),
        staff: staff.trim() || '6 agents',
        status: status.trim() || 'Ouvert (08h - 18h)',
        x: parseInt(xPos) || 150,
        y: parseInt(yPos) || 150
      };

      if (selectedCenter) {
        await onEditCenter(payload);
        addToast(`Centre "${payload.name}" mis à jour avec succès.`, 'success');
      } else {
        await addCenter(payload);
        addToast(`Centre "${payload.name}" ajouté au registre national.`, 'success');
      }
      setShowAddEditModal(false);
    } catch (err) {
      addToast(err.message || 'Erreur lors de l\'enregistrement du centre.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await onDeleteCenter(deleteTarget.id);
      addToast(`Centre "${deleteTarget.name}" supprimé du registre.`, 'success');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || 'Erreur lors de la suppression du centre.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = centers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.region || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="crud-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">{currentUser?.role === 'admin' ? 'Administration des Centres Agréés' : 'Stations de Gravage Agréées'}</h2>
          <p className="page-subtitle">{currentUser?.role === 'admin' ? 'Gérer les stations de gravage laser officielles visibles sur la carte nationale.' : 'Liste des stations de gravage officielles de l\'État auxquelles vous êtes affecté.'}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Ajouter un Centre
          </button>
        )}
      </div>

      {/* Search */}
      <div className="search-bar-wrapper">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Rechercher par nom ou commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="search-meta">{filtered.length} centre(s) trouvé(s)</div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <MapPin size={40} opacity={0.3} />
          <p>Aucun centre trouvé.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((c) => (
            <div key={c.id} className="entity-card center-card">
              <div className="entity-card-header">
                <div>
                  <span className="badge badge-authentic region-badge">
                    <MapPin size={10} /> {c.region}
                  </span>
                  <h3 className="entity-card-title">{c.name}</h3>
                </div>
                {currentUser?.role === 'admin' && (
                  <div className="entity-actions">
                    <button onClick={() => openEditModal(c)} className="btn-icon btn-icon-edit" title="Modifier">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => openDeleteModal(c)} className="btn-icon btn-icon-delete" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <p className="entity-card-desc">{c.desc || 'Aucune description disponible.'}</p>

              <div className="entity-card-meta">
                <div>
                  <span className="meta-label">Effectif</span>
                  <span className="meta-value">{c.staff || 'N/A'}</span>
                </div>
                <div>
                  <span className="meta-label">Horaire</span>
                  <span className="meta-value text-emerald">{c.status}</span>
                </div>
              </div>

              <div className="entity-card-coords">
                Carte : X={c.x}px, Y={c.y}px
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL AJOUTER / MODIFIER ===== */}
      {showAddEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content medium-modal">
            <div className="modal-header">
              <h3>
                <MapPin size={20} style={{ color: 'var(--color-sky-blue)' }} />
                {selectedCenter ? 'Modifier le Centre' : 'Ajouter un Nouveau Centre SPA'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body form-grid">

                <div className="form-group full-width">
                  <label className="form-label">Nom du Centre *</label>
                  <input
                    required type="text" className="form-control"
                    placeholder="Ex: Centre Agréé SPA – Ngaliema"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Région / Commune *</label>
                  <input
                    required type="text" className="form-control"
                    placeholder="Kinshasa - Ngaliema"
                    value={region} onChange={(e) => setRegion(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Effectif du Personnel</label>
                  <input
                    type="text" className="form-control"
                    placeholder="8 agents"
                    value={staff} onChange={(e) => setStaff(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Horaire d'ouverture</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>Ouvert (08h - 18h)</option>
                    <option>Ouvert (06h - 20h)</option>
                    <option>Ouvert 24h/24</option>
                    <option>Fermé temporairement</option>
                    <option>En maintenance</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description des services</label>
                  <textarea
                    className="form-control" rows={3}
                    placeholder="Services de gravage laser des vitrages, rétroviseurs et pièces d'identification..."
                    value={desc} onChange={(e) => setDesc(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ background: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: '10px', gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                    📍 Position sur la carte interactive (pixels)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Axe X (0–600)</label>
                      <input type="number" className="form-control" value={xPos} onChange={(e) => setXPos(e.target.value)} min="0" max="600" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Axe Y (0–450)</label>
                      <input type="number" className="form-control" value={yPos} onChange={(e) => setYPos(e.target.value)} min="0" max="450" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddEditModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> Enregistrement...</> : (selectedCenter ? 'Sauvegarder les modifications' : 'Créer le Centre')}
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
              <h3 style={{ color: 'var(--color-crimson)' }}>Supprimer le Centre</h3>
              <button onClick={() => setShowDeleteModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-warning-box">
                <ShieldAlert size={24} style={{ color: 'var(--color-crimson)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'var(--color-crimson)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Retrait Définitif</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
                    Le centre <strong>{deleteTarget.name}</strong> sera retiré de la carte nationale et du registre.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger" disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                Retirer le Centre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
