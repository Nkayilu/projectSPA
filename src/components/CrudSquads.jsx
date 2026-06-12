import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Radio, User, Battery, X, ShieldAlert, Loader2 } from 'lucide-react';

export default function CrudSquads({ squads, addSquad, onEditSquad, onDeleteSquad, addToast }) {
  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [squadId, setSquadId] = useState('');
  const [inspector, setInspector] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [mission, setMission] = useState('');
  const [battery, setBattery] = useState('100%');
  const [xPos, setXPos] = useState(150);
  const [yPos, setYPos] = useState(150);

  const genId = () => 'SQUAD-' + Math.floor(10 + Math.random() * 90);

  const openAddModal = () => {
    setSelectedSquad(null);
    setSquadId(genId());
    setInspector('');
    setRegion('');
    setStatus('Disponible');
    setMission('');
    setBattery('100%');
    setXPos(150);
    setYPos(150);
    setShowAddEditModal(true);
  };

  const openEditModal = (squad) => {
    setSelectedSquad(squad);
    setSquadId(squad.id);
    setInspector(squad.inspector || '');
    setRegion(squad.region || '');
    setStatus(squad.status || 'Disponible');
    setMission(squad.mission || '');
    setBattery(squad.battery || '100%');
    setXPos(squad.x || 150);
    setYPos(squad.y || 150);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (squad) => {
    setDeleteTarget(squad);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!squadId.trim() || !inspector.trim() || !region.trim()) {
      addToast('ID, inspecteur et région sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: squadId.trim().toUpperCase(),
        inspector: inspector.trim(),
        region: region.trim(),
        status,
        mission: mission.trim(),
        battery: battery || '100%',
        x: parseInt(xPos) || 150,
        y: parseInt(yPos) || 150
      };

      if (selectedSquad) {
        await onEditSquad(payload);
        addToast(`Patrouille ${payload.id} mise à jour avec succès.`, 'success');
      } else {
        await addSquad(payload);
        addToast(`Patrouille ${payload.id} déployée sur le terrain.`, 'success');
      }
      setShowAddEditModal(false);
    } catch (err) {
      addToast(err.message || 'Erreur lors du déploiement de la patrouille.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await onDeleteSquad(deleteTarget.id);
      addToast(`Patrouille "${deleteTarget.id}" rappelée au QG.`, 'success');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || 'Erreur lors du rappel de la patrouille.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s) => {
    if (s === 'Disponible') return 'badge-authentic';
    if (s === 'En Patrouille') return 'badge-pending';
    return 'badge-suspicious';
  };

  const filtered = squads.filter(s =>
    (s.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.inspector || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.region || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="crud-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Supervision des Unités Mobiles</h2>
          <p className="page-subtitle">Déployer et gérer les équipes de patrouille SPA sur le terrain.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Déployer une Unité
        </button>
      </div>

      {/* Search */}
      <div className="search-bar-wrapper">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text" className="form-control search-input"
            placeholder="Rechercher par ID, inspecteur, secteur..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="search-meta">{filtered.length} patrouille(s)</div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Radio size={40} opacity={0.3} />
          <p>Aucune patrouille déployée. Cliquez sur "Déployer une Unité" pour en créer une.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((s) => (
            <div key={s.id} className="entity-card squad-card">
              <div className="entity-card-header">
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>SPA MOBILE RDC</span>
                  <h3 className="entity-card-title squad-title">
                    <Radio size={15} style={{ color: 'var(--color-gold)' }} /> {s.id}
                  </h3>
                </div>
                <div className="entity-actions">
                  <button onClick={() => openEditModal(s)} className="btn-icon btn-icon-edit" title="Modifier">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => openDeleteModal(s)} className="btn-icon btn-icon-delete" title="Rappeler">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="squad-info">
                <div className="squad-info-row">
                  <User size={13} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
                  <span><strong>Inspecteur :</strong> {s.inspector}</span>
                </div>
                <div className="squad-info-row">
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Secteur :</span>
                  <span style={{ fontWeight: 600 }}>{s.region}</span>
                </div>
              </div>

              {s.mission && (
                <p className="squad-mission">
                  <strong>Mission active :</strong> {s.mission}
                </p>
              )}

              <div className="entity-card-footer">
                <span className={`badge ${statusColor(s.status)}`}>{s.status}</span>
                <div className="battery-indicator">
                  <Battery size={14} />
                  <span>{s.battery || 'N/A'}</span>
                </div>
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
                <Radio size={20} style={{ color: 'var(--color-gold)' }} />
                {selectedSquad ? `Modifier Patrouille ${selectedSquad.id}` : 'Déployer une Nouvelle Patrouille'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body form-grid">

                <div className="form-group">
                  <label className="form-label">Identifiant Unité *</label>
                  <input
                    required type="text" className="form-control"
                    placeholder="SQUAD-05" value={squadId}
                    onChange={(e) => setSquadId(e.target.value)}
                    disabled={selectedSquad !== null}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inspecteur Chef *</label>
                  <input
                    required type="text" className="form-control"
                    placeholder="Nom Prénom" value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Région / Secteur *</label>
                  <input
                    required type="text" className="form-control"
                    placeholder="Kinshasa - Limete" value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Niveau de batterie</label>
                  <input
                    type="text" className="form-control"
                    placeholder="95%" value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Statut *</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Disponible">Disponible</option>
                    <option value="En Patrouille">En Patrouille</option>
                    <option value="En Mission">En Mission d'Interception</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description de la mission</label>
                  <textarea
                    className="form-control" rows={3}
                    placeholder="Mission et objectifs en cours..."
                    value={mission} onChange={(e) => setMission(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ background: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: '10px', gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                    📍 Position sur la carte (pixels)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Axe X</label>
                      <input type="number" className="form-control" value={xPos} onChange={(e) => setXPos(e.target.value)} min="0" max="600" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Axe Y</label>
                      <input type="number" className="form-control" value={yPos} onChange={(e) => setYPos(e.target.value)} min="0" max="450" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddEditModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> Déploiement...</> : (selectedSquad ? 'Sauvegarder' : 'Déployer la Patrouille')}
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
              <h3 style={{ color: 'var(--color-crimson)' }}>Rappeler l'Unité</h3>
              <button onClick={() => setShowDeleteModal(false)} className="close-modal-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-warning-box">
                <ShieldAlert size={24} style={{ color: 'var(--color-crimson)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'var(--color-crimson)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Rappel au QG Central</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
                    La patrouille <strong>{deleteTarget.id}</strong> (Inspecteur {deleteTarget.inspector}) sera retirée du déploiement actif.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger" disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                Rappeler l'Unité
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
