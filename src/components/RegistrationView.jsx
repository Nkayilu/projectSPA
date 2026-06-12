import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldCheck, User, Car, FileText, UploadCloud, ChevronRight, CheckCircle2, QrCode, Download, Printer, ArrowLeft, Trash, Plus } from 'lucide-react';

export default function RegistrationView({ addVehicle, addToast, centers = [], currentUser }) {
  const [step, setStep] = useState(1);
  
  // Form State
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
  const [centerId, setCenterId] = useState('');

  // Compute which centers this user can register vehicles for
  const availableCenters = React.useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') return centers;
    // For agents: only their assigned centers (stored in user object or intersect with centers list)
    // The API already filters centers for agents, so we use the centers list as-is
    return centers;
  }, [centers, currentUser]);

  useEffect(() => {
    if (availableCenters && availableCenters.length > 0 && !centerId) {
      setCenterId(availableCenters[0].id);
    } else if (availableCenters && availableCenters.length > 0 && !availableCenters.find(c => c.id === centerId)) {
      // Reset if current centerId is not in available list
      setCenterId(availableCenters[0].id);
    }
  }, [availableCenters]);

  // Upload state
  const [uploadedPhotos, setUploadedPhotos] = useState({
    front: null,
    rear: null,
    side: null,
    engraved: null
  });

  const [uploadedDocs, setUploadedDocs] = useState({
    carteRose: { active: true, doc_number: '', valid_from: '', valid_until: '' },
    insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
    vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
    controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
  });

  const [createdCertificate, setCreatedCertificate] = useState(null);

  // Dynamic parts state
  const [parts, setParts] = useState([
    { name: 'Catalyseur Principal', id: 'CAT-' + Math.floor(10000 + Math.random() * 90000) },
    { name: 'Rétroviseur Gauche', id: 'RET-G-' + Math.floor(100 + Math.random() * 900) },
    { name: 'Rétroviseur Droit', id: 'RET-D-' + Math.floor(100 + Math.random() * 900) }
  ]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCode, setNewPartCode] = useState('');

  // Preloaded mock vehicle photos for immediate visual beauty
  const mockImages = {
    front: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', // SUV
    rear: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    side: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    engraved: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80' // metallic part
  };

  const handleUploadPhoto = (type) => {
    // Simulate photo upload by binding our premium mock unsplash stock photo
    setUploadedPhotos(prev => ({
      ...prev,
      [type]: mockImages[type]
    }));
  };

  const handleToggleDoc = (docName) => {
    if (docName === 'carteRose') return;
    setUploadedDocs(prev => ({
      ...prev,
      [docName]: {
        ...prev[docName],
        active: !prev[docName].active
      }
    }));
  };

  const handleDocChange = (docName, field, value) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docName]: {
        ...prev[docName],
        [field]: value
      }
    }));
  };

  const isDocStepValid = () => {
    const cr = uploadedDocs.carteRose;
    if (!cr.active || !cr.doc_number.trim() || !cr.valid_from || !cr.valid_until) return false;

    for (const key of Object.keys(uploadedDocs)) {
      if (key === 'carteRose') continue;
      const d = uploadedDocs[key];
      if (d.active) {
        if (!d.doc_number.trim() || !d.valid_from || !d.valid_until) return false;
      }
    }
    return true;
  };

  const handleAddPart = () => {
    if (!newPartName.trim() || !newPartCode.trim()) {
      if (addToast) addToast('Nom de pièce et code de marquage requis', 'warning');
      return;
    }
    setParts(prev => [...prev, { name: newPartName.trim(), id: newPartCode.trim().toUpperCase() }]);
    setNewPartName('');
    setNewPartCode('');
  };

  const handleRemovePart = (index) => {
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!plate || !brand || !model || !vin || !ownerName || !ownerId) {
      if (addToast) {
        addToast('Veuillez remplir tous les champs obligatoires.', 'error');
      } else {
        alert('Veuillez remplir tous les champs obligatoires (indiqués par *).');
      }
      return;
    }

    // Validation des documents actifs
    for (const key of Object.keys(uploadedDocs)) {
      const doc = uploadedDocs[key];
      if (doc.active) {
        if (!doc.doc_number.trim() || !doc.valid_from || !doc.valid_until) {
          const docLabels = {
            carteRose: 'Carte Rose RDC',
            insurance: "Attestation d'Assurance",
            vignette: 'Vignette Fiscale',
            controleTechnique: 'Contrôle Technique'
          };
          const label = docLabels[key] || key;
          const msg = `Veuillez remplir le numéro et les dates de validité pour le document : ${label}`;
          if (addToast) addToast(msg, 'error');
          else alert(msg);
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
      center_id: centerId,
      owner: {
        name: ownerName,
        id: ownerId,
        phone: ownerPhone,
        email: ownerEmail
      },
      status: 'authentic',
      parts,
      docs: uploadedDocs
    };

    try {
      const data = await addVehicle(payload);
      if (addToast) {
        addToast(`Véhicule ${payload.plate} enregistré avec succès !`, 'success');
      }

      const displayCert = {
        ...data,
        certificateId: 'SPA-RDC-' + Math.floor(100000 + Math.random() * 900000),
        engravedDate: new Date().toLocaleDateString('fr-FR'),
        center: centers.find(c => c.id === centerId)?.name || 'Centre Agréé SPA RDC'
      };

      setCreatedCertificate(displayCert);
      setStep(4);
    } catch (err) {
      console.error(err);
      if (addToast) {
        addToast(err.message || 'Erreur lors de l\'enregistrement en base de données.', 'error');
      } else {
        alert(err.message || 'Erreur lors de l\'enregistrement.');
      }
    }
  };

  const resetForm = () => {
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
    if (availableCenters && availableCenters.length > 0) {
      setCenterId(availableCenters[0].id);
    } else {
      setCenterId('');
    }
    setUploadedPhotos({ front: null, rear: null, side: null, engraved: null });
    setUploadedDocs({
      carteRose: { active: true, doc_number: '', valid_from: '', valid_until: '' },
      insurance: { active: false, doc_number: '', valid_from: '', valid_until: '' },
      vignette: { active: false, doc_number: '', valid_from: '', valid_until: '' },
      controleTechnique: { active: false, doc_number: '', valid_from: '', valid_until: '' }
    });
    setParts([
      { name: 'Catalyseur Principal', id: 'CAT-' + Math.floor(10000 + Math.random() * 90000) },
      { name: 'Rétroviseur Gauche', id: 'RET-G-' + Math.floor(100 + Math.random() * 900) },
      { name: 'Rétroviseur Droit', id: 'RET-D-' + Math.floor(100 + Math.random() * 900) }
    ]);
    setNewPartName('');
    setNewPartCode('');
    setCreatedCertificate(null);
    setStep(1);
  };

  return (
    <div className="registration-container" style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
      
      {/* Progress Stepper (Not shown in final Success/Certificate step) */}
      {step < 4 && (
        <div className="spa-card mb-3" style={{ padding: '1rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle className="text-sky" size={20} /> Nouveau Dossier de Sécurisation
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Step 1 indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--color-sky-blue)' : 'var(--color-border-light)', color: step >= 1 ? '#ffffff' : 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</div>
                <span style={{ fontSize: '0.75rem', color: step === 1 ? 'var(--color-sky-blue)' : 'var(--color-text-light)', fontWeight: step === 1 ? 700 : 500 }}>Véhicule & Propriétaire</span>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--color-text-light)' }} />
              {/* Step 2 indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--color-sky-blue)' : 'var(--color-border-light)', color: step >= 2 ? '#ffffff' : 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</div>
                <span style={{ fontSize: '0.75rem', color: step === 2 ? 'var(--color-sky-blue)' : 'var(--color-text-light)', fontWeight: step === 2 ? 700 : 500 }}>Identité Visuelle</span>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--color-text-light)' }} />
              {/* Step 3 indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--color-sky-blue)' : 'var(--color-border-light)', color: step >= 3 ? '#ffffff' : 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>3</div>
                <span style={{ fontSize: '0.75rem', color: step === 3 ? 'var(--color-sky-blue)' : 'var(--color-text-light)', fontWeight: step === 3 ? 700 : 500 }}>Pièces Justificatives</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM BODY */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="spa-card accent-card" style={{ textAlign: 'left' }}>
          <h2 className="mb-2"><Car className="text-sky" size={24} style={{ display: 'inline', marginRight: '8px' }} />Étape 1 : Caractéristiques du Véhicule & Propriétaire</h2>
          <p className="mb-3" style={{ fontSize: '0.85rem' }}>Saisissez les spécifications officielles de la carte rose et de l'autorité d'enregistrement.</p>
          
          <div className="grid-2">
            
            {/* Vehicle details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--color-sky-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>Fiche Technique Véhicule</h3>
              
              <div className="form-group">
                <label>Numéro d'Immatriculation *</label>
                <input required type="text" className="form-control" placeholder="Ex: AA-1234-BC" value={plate} onChange={(e) => setPlate(e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Marque *</label>
                  <input required type="text" className="form-control" placeholder="Ex: Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Modèle *</label>
                  <input required type="text" className="form-control" placeholder="Ex: Prado" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Numéro de Châssis (VIN) *</label>
                  <input required type="text" className="form-control" placeholder="Saisir les 17 caractères" value={vin} onChange={(e) => setVin(e.target.value)} style={{ textTransform: 'uppercase' }} maxLength={17} />
                </div>
                <div className="form-group">
                  <label>Catégorie Véhicule</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Berline">Berline / Citadine</option>
                    <option value="SUV">SUV / Tout-Terrain</option>
                    <option value="Utilitaire">Camionnette / Pickup</option>
                    <option value="Moto">Moto / Tricycle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Année de Fabrication</label>
                  <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Couleur Carrosserie</label>
                  <input type="text" className="form-control" placeholder="Ex: Blanc Nacré" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Station de Gravage de l'enregistrement *</label>
                {currentUser?.role === 'agent' && availableCenters.length === 1 ? (
                  // Agent with single assigned station — lock it
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      readOnly
                      className="form-control"
                      value={`${availableCenters[0]?.name} (${availableCenters[0]?.region})`}
                      style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-subtle)', cursor: 'not-allowed' }}
                    />
                    <span className="badge badge-authentic" style={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }}>🔒 Affecté</span>
                  </div>
                ) : (
                  <select 
                    required 
                    className="form-control" 
                    value={centerId} 
                    onChange={(e) => setCenterId(e.target.value)}
                  >
                    {availableCenters.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.region})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Owner details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--color-sky-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>Identité du Propriétaire</h3>
              
              <div className="form-group">
                <label><User size={14} /> Nom & Prénoms complets (ou Entreprise) *</label>
                <input required type="text" className="form-control" placeholder="Ex: Kabasele Mwamba Dieudonné" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Numéro de Pièce d'Identité (ID / Carte d'électeur) *</label>
                <input required type="text" className="form-control" placeholder="Ex: ID-CG-XXXXXXXX" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Numéro de Téléphone mobile</label>
                <input type="tel" className="form-control" placeholder="Ex: +243 812 345 678" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Adresse E-mail</label>
                <input type="email" className="form-control" placeholder="Ex: dieudonne@kabasele.cd" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
            </div>

          </div>

          {/* --- Dynamic Parts Section --- */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-sky-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔩 Pièces à Graver au Laser ({parts.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {parts.length > 0 ? (
                parts.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.15)', padding: '0.5rem 0.9rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <code style={{ fontSize: '0.78rem', color: 'var(--color-authentic)', fontWeight: 700 }}>{p.id}</code>
                      <button type="button" onClick={() => handleRemovePart(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--color-crimson)', cursor: 'pointer', padding: '2px' }}>
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textAlign: 'center', padding: '0.5rem', fontStyle: 'italic' }}>Aucune pièce ajoutée.</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end', background: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Nom de la pièce</label>
                <input type="text" className="form-control" placeholder="Ex: Catalyseur" value={newPartName} onChange={e => setNewPartName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Code de Marquage Laser</label>
                <input type="text" className="form-control" placeholder="CAT-12345" value={newPartCode} onChange={e => setNewPartCode(e.target.value.toUpperCase())} />
              </div>
              <button type="button" onClick={handleAddPart} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
                <Plus size={15} /> Ajouter
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">
              Continuer vers l'étape 2 <ChevronRight size={16} />
            </button>
          </div>
        </form>

      )}

      {step === 2 && (
        <div className="spa-card accent-card" style={{ textAlign: 'left' }}>
          <h2 className="mb-2"><Car className="text-sky" size={24} style={{ display: 'inline', marginRight: '8px' }} />Étape 2 : Galerie Photo d'Identité Numérique</h2>
          <p className="mb-3" style={{ fontSize: '0.85rem' }}>Ajoutez les clichés obligatoires du véhicule. Les photos du véhicule permettent la vérification croisée physique par la police routière.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Front view */}
            <div className="spa-card text-center flex-center" style={{ flexDirection: 'column', padding: '1rem', backgroundColor: 'var(--color-bg-base)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Vue de Face *</span>
              {uploadedPhotos.front ? (
                <img src={uploadedPhotos.front} className="file-preview-img" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="Devant" />
              ) : (
                <div onClick={() => handleUploadPhoto('front')} className="file-dropzone" style={{ width: '100%', height: '120px', padding: '1rem' }}>
                  <UploadCloud size={24} style={{ color: 'var(--color-sky-blue)' }} />
                  <span style={{ fontSize: '0.65rem' }}>Simuler Upload</span>
                </div>
              )}
            </div>

            {/* Rear view */}
            <div className="spa-card text-center flex-center" style={{ flexDirection: 'column', padding: '1rem', backgroundColor: 'var(--color-bg-base)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Vue Arrière *</span>
              {uploadedPhotos.rear ? (
                <img src={uploadedPhotos.rear} className="file-preview-img" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="Arrière" />
              ) : (
                <div onClick={() => handleUploadPhoto('rear')} className="file-dropzone" style={{ width: '100%', height: '120px', padding: '1rem' }}>
                  <UploadCloud size={24} style={{ color: 'var(--color-sky-blue)' }} />
                  <span style={{ fontSize: '0.65rem' }}>Simuler Upload</span>
                </div>
              )}
            </div>

            {/* Profile view */}
            <div className="spa-card text-center flex-center" style={{ flexDirection: 'column', padding: '1rem', backgroundColor: 'var(--color-bg-base)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Vue de Profil (Côté) *</span>
              {uploadedPhotos.side ? (
                <img src={uploadedPhotos.side} className="file-preview-img" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="Côté" />
              ) : (
                <div onClick={() => handleUploadPhoto('side')} className="file-dropzone" style={{ width: '100%', height: '120px', padding: '1rem' }}>
                  <UploadCloud size={24} style={{ color: 'var(--color-sky-blue)' }} />
                  <span style={{ fontSize: '0.65rem' }}>Simuler Upload</span>
                </div>
              )}
            </div>

            {/* Engraving photo */}
            <div className="spa-card text-center flex-center" style={{ flexDirection: 'column', padding: '1rem', backgroundColor: 'var(--color-bg-base)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Photo Marquage Laser *</span>
              {uploadedPhotos.engraved ? (
                <img src={uploadedPhotos.engraved} className="file-preview-img" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="Marquage" />
              ) : (
                <div onClick={() => handleUploadPhoto('engraved')} className="file-dropzone" style={{ width: '100%', height: '120px', padding: '1rem' }}>
                  <UploadCloud size={24} style={{ color: 'var(--color-sky-blue)' }} />
                  <span style={{ fontSize: '0.65rem' }}>Simuler Gravage</span>
                </div>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
            <button onClick={() => setStep(1)} type="button" className="btn btn-secondary">
              <ArrowLeft size={16} /> Étape 1
            </button>
            <button onClick={() => setStep(3)} type="button" className="btn btn-primary" disabled={!uploadedPhotos.front || !uploadedPhotos.rear}>
              Continuer vers l'étape 3 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="spa-card accent-card" style={{ textAlign: 'left' }}>
          <h2 className="mb-2"><FileText className="text-sky" size={24} style={{ display: 'inline', marginRight: '8px' }} />Étape 3 : Documents Administratifs</h2>
          <p className="mb-3" style={{ fontSize: '0.85rem' }}>Déposez et enregistrez les informations de validité des justificatifs requis pour authentifier la carte rose et l'identité légale.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            
            {/* Doc 1: Carte Rose */}
            <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 700 }}>Carte Rose Légitime RDC *</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Indispensable pour attester de la propriété du châssis et des plaques.</p>
                </div>
                <span className="badge badge-authentic" style={{ fontSize: '0.7rem', border: '1px solid var(--color-authentic)' }}>Obligatoire</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Numéro de Carte Rose *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: CR-89021"
                    value={uploadedDocs.carteRose.doc_number}
                    onChange={(e) => handleDocChange('carteRose', 'doc_number', e.target.value)}
                    style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Date d'émission *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={uploadedDocs.carteRose.valid_from}
                    onChange={(e) => handleDocChange('carteRose', 'valid_from', e.target.value)}
                    style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Expire le *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={uploadedDocs.carteRose.valid_until}
                    onChange={(e) => handleDocChange('carteRose', 'valid_until', e.target.value)}
                    style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Doc 2: Assurance */}
            <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: '12px', border: uploadedDocs.insurance.active ? '1px solid var(--color-sky-blue)' : '1px solid var(--color-border-light)', transition: 'border 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: uploadedDocs.insurance.active ? '1rem' : '0' }}>
                <div>
                  <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 700 }}>Attestation d'Assurance</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Preuve d'assurance en cours de validité (SONAS ou autre courtier agréé).</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleDoc('insurance')}
                  className={`btn ${uploadedDocs.insurance.active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  {uploadedDocs.insurance.active ? '✓ Activée' : '+ Activer'}
                </button>
              </div>
              
              {uploadedDocs.insurance.active && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', animation: 'scaleInAlert 0.2s ease-out' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Numéro de Police *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: POL-9081"
                      value={uploadedDocs.insurance.doc_number}
                      onChange={(e) => handleDocChange('insurance', 'doc_number', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Début de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.insurance.valid_from}
                      onChange={(e) => handleDocChange('insurance', 'valid_from', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Fin de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.insurance.valid_until}
                      onChange={(e) => handleDocChange('insurance', 'valid_until', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Doc 3: Vignette */}
            <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: '12px', border: uploadedDocs.vignette.active ? '1px solid var(--color-sky-blue)' : '1px solid var(--color-border-light)', transition: 'border 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: uploadedDocs.vignette.active ? '1rem' : '0' }}>
                <div>
                  <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 700 }}>Vignette Fiscale Annuelle</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Attestation de paiement de la taxe sur la vignette pour l'exercice en cours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleDoc('vignette')}
                  className={`btn ${uploadedDocs.vignette.active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  {uploadedDocs.vignette.active ? '✓ Activée' : '+ Activer'}
                </button>
              </div>
              
              {uploadedDocs.vignette.active && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', animation: 'scaleInAlert 0.2s ease-out' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Numéro de Vignette *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: VIG-45210"
                      value={uploadedDocs.vignette.doc_number}
                      onChange={(e) => handleDocChange('vignette', 'doc_number', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Début de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.vignette.valid_from}
                      onChange={(e) => handleDocChange('vignette', 'valid_from', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Fin de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.vignette.valid_until}
                      onChange={(e) => handleDocChange('vignette', 'valid_until', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Doc 4: Controle technique */}
            <div style={{ background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: '12px', border: uploadedDocs.controleTechnique.active ? '1px solid var(--color-sky-blue)' : '1px solid var(--color-border-light)', transition: 'border 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: uploadedDocs.controleTechnique.active ? '1rem' : '0' }}>
                <div>
                  <h4 style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 700 }}>Contrôle Technique RDC</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Rapport officiel de visite technique obligatoire.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleDoc('controleTechnique')}
                  className={`btn ${uploadedDocs.controleTechnique.active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  {uploadedDocs.controleTechnique.active ? '✓ Activé' : '+ Activer'}
                </button>
              </div>
              
              {uploadedDocs.controleTechnique.active && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', animation: 'scaleInAlert 0.2s ease-out' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Numéro de Certificat *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: CT-7712-B"
                      value={uploadedDocs.controleTechnique.doc_number}
                      onChange={(e) => handleDocChange('controleTechnique', 'doc_number', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Début de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.controleTechnique.valid_from}
                      onChange={(e) => handleDocChange('controleTechnique', 'valid_from', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Fin de validité *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={uploadedDocs.controleTechnique.valid_until}
                      onChange={(e) => handleDocChange('controleTechnique', 'valid_until', e.target.value)}
                      style={{ fontSize: '0.85rem', minHeight: '40px', padding: '0.5rem' }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
            <button onClick={() => setStep(2)} type="button" className="btn btn-secondary">
              <ArrowLeft size={16} /> Étape 2
            </button>
            <button onClick={handleSubmit} type="button" className="btn btn-primary" disabled={!isDocStepValid()}>
              Valider & Générer le Certificat SPA <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS & CERTIFICATE DISPLAY */}
      {step === 4 && createdCertificate && (
        <div style={{ animation: 'scaleInAlert 0.4s ease-out' }}>
          
          <div className="spa-card text-center mb-3" style={{ border: '2px solid var(--color-authentic)', backgroundColor: 'var(--color-card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--color-authentic)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-authentic)' }}>
                <ShieldCheck size={36} />
              </div>
            </div>
            <h2 style={{ color: 'var(--color-text-main)', fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Sécurisation Enregistrée avec Succès !</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.9rem', color: 'var(--color-text-subtle)' }}>
              Le profil de votre véhicule est validé. Votre certificat numérique national et vos pièces gravées laser sont actifs dans le registre d'immatriculation centralisé de la RDC.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} /> Imprimer le Certificat
              </button>
              <button onClick={resetForm} className="btn btn-secondary">
                <PlusCircle size={16} /> Enregistrer un autre véhicule
              </button>
            </div>
          </div>

          {/* PRINTABLE DYNAMIC SECURISATION CERTIFICATE CANVAS */}
          <div className="certificate-box">
            <div className="certificate-watermark">SPA RDC</div>
            <div className="certificate-flag"></div>
            
            <div className="certificate-header">
              <span className="cert-authority">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
              <h2 className="cert-title">CERTIFICAT DE TRAÇABILITÉ</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-sky-blue)', letterSpacing: '0.1em' }}>SÉCURITÉ PIÈCES AUTO (SPA RDC)</span>
              <div className="cert-divider"></div>
            </div>

            <div className="certificate-body">
              <div className="cert-row">
                <span>RÉFÉRENCE DE CERTIFICAT</span>
                <span>{createdCertificate.certificateId}</span>
              </div>
              <div className="cert-row">
                <span>IMMATRICULATION RDC</span>
                <span style={{ color: 'var(--color-sky-blue)' }}>{createdCertificate.plate}</span>
              </div>
              <div className="cert-row">
                <span>MARQUE & MODÈLE</span>
                <span>{createdCertificate.brand} {createdCertificate.model}</span>
              </div>
              <div className="cert-row">
                <span>NUMÉRO DE CHÂSSIS (VIN)</span>
                <span style={{ fontSize: '0.8rem' }}>{createdCertificate.vin}</span>
              </div>
              <div className="cert-row">
                <span>PROPRIÉTAIRE CERTIFIÉ</span>
                <span>{createdCertificate.owner?.name || createdCertificate.owner?.full_name || ownerName}</span>
              </div>
              <div className="cert-row">
                <span>DATE DE DÉLIVRANCE</span>
                <span>{createdCertificate.engravedDate}</span>
              </div>
              <div className="cert-row">
                <span>STATUT DE SÉCURITÉ</span>
                <span style={{ color: 'var(--color-authentic)' }}>CONFORME & PROTÉGÉ</span>
              </div>
            </div>

            <div className="certificate-footer">
              <div className="cert-stamp-qr" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {createdCertificate.qr_image_data ? (
                  <img src={createdCertificate.qr_image_data} alt="QR Code SPA" style={{ width: '80px', height: '80px', border: '1px solid #CBD5E1', padding: '4px', borderRadius: '4px', backgroundColor: '#FFFFFF' }} />
                ) : (
                  <div className="cert-qr-mock">
                    <QrCode size={72} style={{ color: '#0F172A' }} />
                  </div>
                )}
                <div className="cert-stamp-seal">
                  SPA<br />MINISTÈRE<br />INTÉRIEUR
                </div>
              </div>
              <div className="cert-signature">
                <span>Le Secrétaire Général à la Sécurité</span>
                <div className="cert-sig-line">Signé Numériquement</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );

}
