import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, ShieldCheck, ShieldAlert, Clock, X, Car, User, FileText, Calendar, PlusCircle, Trash, QrCode, Download, Eye } from 'lucide-react';

export default function CrudVehicles({ vehicles, addVehicle, onEditVehicle, onDeleteVehicle, addToast, loading, currentUser }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalVehicle, setQrModalVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form Fields State
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [vin, setVin] = useState('');
  const [year, setYear] = useState('2024');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('SUV');
  const [ownerName, setOwnerName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [status, setStatus] = useState('authentic');
  const [parts, setParts] = useState([]);
  
  // Document state checklist
  const [docs, setDocs] = useState({
    carteRose: { active: true, doc_number: '', valid_from: '', valid_until: '' },
    insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
    vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
    controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
  });

  // Stolen details (if status is suspicious)
  const [stolenDate, setStolenDate] = useState('');
  const [stolenLocation, setStolenLocation] = useState('');

  // Part editor field state
  const [newPartName, setNewPartName] = useState('');
  const [newPartId, setNewPartId] = useState('');

  const handleToggleDoc = (docName) => {
    if (docName === 'carteRose') return;
    setDocs(prev => ({
      ...prev,
      [docName]: {
        ...prev[docName],
        active: !prev[docName].active
      }
    }));
  };

  const handleDocChange = (docName, field, value) => {
    setDocs(prev => ({
      ...prev,
      [docName]: {
        ...prev[docName],
        [field]: value
      }
    }));
  };

  const isDocFormValid = () => {
    const cr = docs.carteRose;
    if (!cr.active || !cr.doc_number.trim() || !cr.valid_from || !cr.valid_until) return false;

    for (const key of Object.keys(docs)) {
      if (key === 'carteRose') continue;
      const d = docs[key];
      if (d.active) {
        if (!d.doc_number.trim() || !d.valid_from || !d.valid_until) return false;
      }
    }
    return true;
  };

  const openAddModal = () => {
    setSelectedVehicle(null);
    setPlate('');
    setBrand('');
    setModel('');
    setVin('');
    setYear('2024');
    setColor('');
    setCategory('SUV');
    setOwnerName('');
    setOwnerId('');
    setOwnerPhone('');
    setOwnerEmail('');
    setStatus('authentic');
    setParts([
      { name: 'Catalyseur Principal', id: 'CAT-' + Math.floor(10000 + Math.random() * 90000) },
      { name: 'Rétroviseur Gauche', id: 'RET-G-' + Math.floor(100 + Math.random() * 900) },
      { name: 'Rétroviseur Droit', id: 'RET-D-' + Math.floor(100 + Math.random() * 900) }
    ]);
    setDocs({
      carteRose: { active: true, doc_number: '', valid_from: '', valid_until: '' },
      insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
      vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
      controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
    });
    setStolenDate('');
    setStolenLocation('');
    setShowAddEditModal(true);
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setPlate(vehicle.plate);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setVin(vehicle.vin);
    setYear(vehicle.year || '2024');
    setColor(vehicle.color || '');
    setCategory(vehicle.category || 'SUV');
    setOwnerName(vehicle.owner?.name || '');
    setOwnerId(vehicle.owner?.id || '');
    setOwnerPhone(vehicle.owner?.phone || '');
    setOwnerEmail(vehicle.owner?.email || '');
    setStatus(vehicle.status || 'authentic');
    setParts(vehicle.parts || []);
    
    if (vehicle.documents && vehicle.documents.length > 0) {
      const newDocs = {
        carteRose: { active: false, doc_number: '', valid_from: '', valid_until: '' },
        insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
        vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
        controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
      };

      for (const d of vehicle.documents) {
        if (newDocs[d.doc_type]) {
          newDocs[d.doc_type] = {
            active: true,
            doc_number: d.doc_number || '',
            valid_from: d.valid_from || '',
            valid_until: d.valid_until || ''
          };
        }
      }
      
      // Assurer que la carte rose reste toujours active par défaut
      newDocs.carteRose.active = true;
      setDocs(newDocs);
    } else {
      setDocs({
        carteRose: { active: true, doc_number: '', valid_from: '', valid_until: '' },
        insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
        vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
        controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
      });
    }

    setStolenDate(vehicle.stolenReport?.date || '');
    setStolenLocation(vehicle.stolenReport?.location || '');
    setShowAddEditModal(true);
  };

  const openDeleteModal = (vehicle) => {
    setDeleteTarget(vehicle);
    setShowDeleteModal(true);
  };

  const handleAddPart = () => {
    if (!newPartName.trim() || !newPartId.trim()) {
      addToast('Nom de pièce et identifiant requis', 'warning');
      return;
    }
    setParts([...parts, { name: newPartName.trim(), id: newPartId.trim().toUpperCase() }]);
    setNewPartName('');
    setNewPartId('');
    addToast('Pièce ajoutée temporairement à la liste', 'success');
  };

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
    addToast('Pièce retirée de la liste', 'success');
  };

  const handleDownloadQR = (imgData, plate) => {
    if (!imgData) return;
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `QR-SPA-${plate}.png`;
    a.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!plate || !brand || !model || !vin || !ownerName || !ownerId) {
      addToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    // Validation des documents actifs
    for (const key of Object.keys(docs)) {
      const doc = docs[key];
      if (doc.active) {
        if (!doc.doc_number.trim() || !doc.valid_from || !doc.valid_until) {
          const docLabels = {
            carteRose: 'Carte Rose RDC',
            insurance: "Attestation d'Assurance",
            vignette: 'Vignette Fiscale',
            controleTechnique: 'Contrôle Technique'
          };
          const label = docLabels[key] || key;
          addToast(`Veuillez remplir le numéro et les dates de validité pour le document : ${label}`, 'error');
          return;
        }
      }
    }

    const payload = {
      plate: plate.toUpperCase(),
      brand,
      model,
      vin: vin.toUpperCase(),
      year,
      color,
      category,
      owner: {
        name: ownerName,
        id: ownerId,
        phone: ownerPhone,
        email: ownerEmail
      },
      status,
      parts,
      docs,
      qrCode: selectedVehicle?.qrCode || 'SPA-QR-' + Math.floor(1000 + Math.random() * 9000),
      certificateId: selectedVehicle?.certificateId || 'SPA-RDC-' + Math.floor(100000 + Math.random() * 900000),
      engravedDate: selectedVehicle?.engravedDate || new Date().toLocaleDateString('fr-FR'),
      center: selectedVehicle?.center || 'Centre National d\'Enregistrement RDC',
      stolenReport: status === 'suspicious' ? {
        date: stolenDate || new Date().toLocaleDateString('fr-FR'),
        location: stolenLocation || 'Kinshasa',
        incidentId: selectedVehicle?.stolenReport?.incidentId || 'INC-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Recherché par la Police RDC (PNC)'
      } : null
    };

    try {
      if (selectedVehicle) {
        await onEditVehicle(payload);
        addToast(`Véhicule ${payload.plate} mis à jour avec succès`, 'success');
      } else {
        await addVehicle(payload);
        addToast(`Véhicule ${payload.plate} enregistré avec succès`, 'success');
      }
      setShowAddEditModal(false);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Impossible d\'enregistrer les modifications.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      try {
        await onDeleteVehicle(deleteTarget.plate);
        addToast(`Véhicule ${deleteTarget.plate} supprimé avec succès`, 'success');
        setShowDeleteModal(false);
        setDeleteTarget(null);
      } catch (err) {
        console.error(err);
        addToast('Impossible de supprimer le véhicule de la base centrale.', 'error');
      }
    }
  };

  // Filter and search
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.plate.toUpperCase().includes(search.toUpperCase()) ||
      v.brand.toUpperCase().includes(search.toUpperCase()) ||
      v.model.toUpperCase().includes(search.toUpperCase()) ||
      v.owner.name.toUpperCase().includes(search.toUpperCase()) ||
      v.vin.toUpperCase().includes(search.toUpperCase());
    
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '2rem', animation: 'scaleInAlert 0.4s ease-out' }}>
      
      {/* Title & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--color-text-main)' }}>
            Registre National des Véhicules Sécurisés
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            Ajouter, éditer, certifier ou déclarer volé un véhicule et ses pièces gravées au laser.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Enregistrer un Véhicule
        </button>
      </div>

      {/* Filters & Search Grid */}
      <div className="spa-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par Plaque, Marque, VIN, Propriétaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Statut :</span>
          <select 
            className="form-control" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '160px', padding: '0.5rem' }}
          >
            <option value="all">Tous</option>
            <option value="authentic">Authentiques</option>
            <option value="suspicious">Signalés Volés</option>
            <option value="pending">En attente</option>
          </select>
        </div>

      </div>

      {/* Main Vehicles Table */}
      <div className="spa-table-wrapper">
        <table className="spa-table">
          <thead>
            <tr>
              <th>Véhicule / Plaque</th>
              <th>Propriétaire</th>
              <th>Châssis (VIN)</th>
              <th>Pièces Marquées</th>
              <th>QR Code</th>
              <th>Statut</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => (
                <tr key={v.plate}>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{v.brand} {v.model}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-sky-blue)', fontWeight: 700, marginTop: '0.1rem' }}>{v.plate}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{v.owner?.name || v.owner?.full_name || '—'}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{v.owner?.id}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 6px' }}>{v.vin}</code>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#F1F5F9', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                      {v.parts?.length || 0} pièces
                    </span>
                  </td>
                  <td>
                    {v.qr_image_data ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={v.qr_image_data}
                          alt="QR"
                          style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}
                          onClick={() => { setQrModalVehicle(v); setShowQrModal(true); }}
                          title="Voir le QR Code"
                        />
                        <button
                          onClick={() => handleDownloadQR(v.qr_image_data, v.plate)}
                          className="btn-icon"
                          title="Télécharger QR"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      v.status === 'authentic' ? 'badge-authentic' :
                      v.status === 'suspicious' ? 'badge-suspicious' :
                      'badge-pending'
                    }`}>
                      {v.status === 'authentic' && 'Authentique'}
                      {v.status === 'suspicious' && 'Signalé Volé'}
                      {v.status === 'pending' && 'En Attente'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(v)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} title="Modifier">
                        <Edit size={14} />
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button onClick={() => openDeleteModal(v)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-crimson)', borderColor: 'rgba(206,16,46,0.2)' }} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                  Aucun véhicule ne correspond aux critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =============================================================
       * MODAL : ADD / EDIT VEHICLE
       * ============================================================= */}
      {showAddEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car size={20} className="text-sky" />
                {selectedVehicle ? `Modifier le véhicule ${selectedVehicle.plate}` : 'Enregistrer un Nouveau Véhicule'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Section 1: Spec Sheet */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-sky-blue)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    Fiche Technique
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Numéro d'Immatriculation *</label>
                      <input required type="text" className="form-control" placeholder="Ex: CGO-1234-AA" value={plate} onChange={(e) => setPlate(e.target.value)} style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="form-group">
                      <label>Numéro de Châssis (VIN) *</label>
                      <input required type="text" className="form-control" placeholder="17 caractères" value={vin} onChange={(e) => setVin(e.target.value)} style={{ textTransform: 'uppercase' }} maxLength={17} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Marque *</label>
                      <input required type="text" className="form-control" placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Modèle *</label>
                      <input required type="text" className="form-control" placeholder="Prado" value={model} onChange={(e) => setModel(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Berline">Berline</option>
                        <option value="SUV">SUV</option>
                        <option value="Utilitaire">Utilitaire</option>
                        <option value="Moto">Moto</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Année</label>
                      <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Couleur</label>
                      <input type="text" className="form-control" placeholder="Noir Métallisé" value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Owner Details */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-sky-blue)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    Propriétaire
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Nom & Prénoms *</label>
                      <input required type="text" className="form-control" placeholder="Mbuyi Kalombo" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Pièce d'Identité *</label>
                      <input required type="text" className="form-control" placeholder="ID-CG-90218" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input type="tel" className="form-control" placeholder="+243..." value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" className="form-control" placeholder="owner@email.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Status Details */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-sky-blue)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    Statut de Sécurisation RDC
                  </h4>
                  <div className="form-group">
                    <label>Sélectionner le Statut</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="authentic">Authentique / Sécurisé (Vert)</option>
                      <option value="pending">En attente de Gravage (Orange)</option>
                      <option value="suspicious">Signalé Volé (Rouge)</option>
                    </select>
                  </div>

                  {status === 'suspicious' && (
                    <div className="delete-warning-box" style={{ background: 'rgba(206,16,46,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px dashed var(--color-crimson)', width: '100%' }}>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-crimson)' }}>Date du Signalement de Vol</label>
                        <input type="text" className="form-control" placeholder="Ex: 21/05/2026" value={stolenDate} onChange={(e) => setStolenDate(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-crimson)' }}>Lieu Estimé du Vol</label>
                        <input type="text" className="form-control" placeholder="Limete Poids Lourds" value={stolenLocation} onChange={(e) => setStolenLocation(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3b: Documents administratifs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-sky-blue)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
                    Documents Administratifs liés
                  </h4>
                  {Object.keys(docs).map((key) => {
                    const docLabels = {
                      carteRose: 'Carte Rose RDC',
                      insurance: 'Assurance SONAS',
                      vignette: 'Vignette Fiscale',
                      controleTechnique: 'Contrôle Technique'
                    };
                    const label = docLabels[key] || key;
                    const isActive = docs[key].active;
                    
                    return (
                      <div key={key} style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActive ? '0.5rem' : '0' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{label}</span>
                          {key === 'carteRose' ? (
                            <span className="badge badge-authentic" style={{ fontSize: '0.65rem' }}>Obligatoire</span>
                          ) : (
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleDoc(key)}
                                style={{ width: 'auto', minHeight: 'auto', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '0.75rem' }}>{isActive ? 'Actif' : 'Inactif'}</span>
                            </label>
                          )}
                        </div>
                        {isActive && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Numéro *</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Numéro"
                                value={docs[key].doc_number}
                                onChange={(e) => handleDocChange(key, 'doc_number', e.target.value)}
                                style={{ fontSize: '0.78rem', minHeight: '32px', padding: '0.25rem 0.5rem' }}
                                required
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Émis le *</label>
                              <input
                                type="date"
                                className="form-control"
                                value={docs[key].valid_from}
                                onChange={(e) => handleDocChange(key, 'valid_from', e.target.value)}
                                style={{ fontSize: '0.78rem', minHeight: '32px', padding: '0.25rem 0.5rem' }}
                                required
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Expire le *</label>
                              <input
                                type="date"
                                className="form-control"
                                value={docs[key].valid_until}
                                onChange={(e) => handleDocChange(key, 'valid_until', e.target.value)}
                                style={{ fontSize: '0.78rem', minHeight: '32px', padding: '0.25rem 0.5rem' }}
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Section 3c: QR Code (if editing and exists) */}
                {selectedVehicle && selectedVehicle.qr_image_data && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>QR Code de Vérification National</span>
                    <img src={selectedVehicle.qr_image_data} alt="QR Code" style={{ width: '100px', height: '100px', border: '1px solid #E2E8F0', padding: '4px', borderRadius: '4px', backgroundColor: '#FFFFFF' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>Jeton de sécurité : <code>{selectedVehicle.qrCode}</code></span>
                  </div>
                )}

                {/* Section 4: Parts Management */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-sky-blue)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    Pièces Gravées au Laser ({parts.length})
                  </h4>
                  
                  {/* List of current parts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {parts.length > 0 ? (
                      parts.map((p, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', fontWeight: 600 }}>{p.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <code style={{ fontSize: '0.75rem', color: 'var(--color-authentic)', fontWeight: 700 }}>{p.id}</code>
                            <button type="button" onClick={() => handleRemovePart(index)} style={{ background: 'transparent', border: 'none', color: 'var(--color-crimson)', cursor: 'pointer' }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>Aucune pièce gravée enregistrée.</p>
                    )}
                  </div>

                  {/* Add parts builder */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end', background: '#F1F5F9', padding: '0.75rem', borderRadius: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Nom de la pièce</label>
                      <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Ex: Rétroviseur Gauche" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Code de Marquage Laser</label>
                      <input type="text" className="form-control" style={{ padding: '0.4rem', textTransform: 'uppercase' }} placeholder="RET-G-882" value={newPartId} onChange={(e) => setNewPartId(e.target.value)} />
                    </div>
                    <button type="button" onClick={handleAddPart} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', borderRadius: '8px' }}>
                      <PlusCircle size={16} /> Ajouter
                    </button>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddEditModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={!isDocFormValid()}>
                  {selectedVehicle ? 'Enregistrer les Modifications' : 'Enregistrer le Véhicule'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =============================================================
       * MODAL : DELETE CONFIRMATION
       * ============================================================= */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-content medium-modal">
            
            <div className="modal-header">
              <h3 style={{ color: 'var(--color-crimson)' }}>Confirmation de Suppression</h3>
              <button onClick={() => setShowDeleteModal(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning-box">
                <ShieldAlert className="text-crimson" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-crimson)', marginBottom: '0.25rem' }}>Action Irréversible</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                    Vous êtes sur le point de retirer définitivement le véhicule immatriculé <strong>{deleteTarget.plate}</strong> de la base centrale SPA RDC.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Cela supprimera également tous les codes de marquage associés à ce profil. Cette action sera consignée dans les rapports d'administration.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-primary" style={{ backgroundColor: 'var(--color-crimson)', borderColor: 'var(--color-crimson)' }}>
                Confirmer la Suppression
              </button>
            </div>

          </div>
        </div>
      )}
      {/* =============================================================
       * MODAL : QR Code Viewer
       * ============================================================= */}
      {showQrModal && qrModalVehicle && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-content medium-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} className="text-sky" />
                QR Code — {qrModalVehicle.plate}
              </h3>
              <button onClick={() => setShowQrModal(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
              <img
                src={qrModalVehicle.qr_image_data}
                alt={`QR SPA ${qrModalVehicle.plate}`}
                style={{ width: '220px', height: '220px', border: '2px solid var(--color-border-light)', padding: '8px', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
              />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{qrModalVehicle.brand} {qrModalVehicle.model}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-sky-blue)', fontWeight: 600 }}>{qrModalVehicle.plate}</p>
                <code style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', display: 'block', marginTop: '0.25rem' }}>{qrModalVehicle.qrCode}</code>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowQrModal(false)} className="btn btn-secondary">Fermer</button>
              <button onClick={() => handleDownloadQR(qrModalVehicle.qr_image_data, qrModalVehicle.plate)} className="btn btn-primary">
                <Download size={16} /> Télécharger PNG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
