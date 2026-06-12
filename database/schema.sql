-- ============================================================================
-- SPA RDC (Smart Parts Authentication Platform)
-- Schema de la base de données relationnelle et normalisée
-- Optimisé pour PostgreSQL
-- ============================================================================

-- Activer l'extension pour générer des UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppression des tables si elles existent pour réinitialisation propre
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS vehicle_modification_history CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Table des Rôles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table de liaison Rôles - Permissions (Relation N:M)
CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Table des Utilisateurs de l'application (Administrateurs, Agents, PNC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Propriétaires de véhicules
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Véhicules
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL CHECK (length(vin) = 17),
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_manufactured INT NOT NULL CHECK (year_manufactured >= 1900 AND year_manufactured <= extract(year from current_date) + 1),
    color VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL CHECK (vehicle_type IN ('Berline', 'SUV', 'Utilitaire', 'Moto')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'STOLEN', 'EXPIRED')),
    owner_id UUID REFERENCES owners(id) ON DELETE RESTRICT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des QR Codes
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE UNIQUE,
    secure_token VARCHAR(64) UNIQUE NOT NULL, -- Jeton cryptographique crypté / aléatoire unique
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 8. Table d'historique des modifications des véhicules
CREATE TABLE vehicle_modification_history (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Utilisateur ayant fait le changement
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(10) CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
    modified_field VARCHAR(50),
    old_value TEXT,
    new_value TEXT
);

-- 9. Table du Journal d'Audit (Actions critiques système)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXATION POUR L'OPTIMISATION DES REQUÊTES
-- ============================================================================

-- Recherche rapide de véhicules par plaque ou numéro de châssis
CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);

-- Recherche rapide des QR Codes par jeton sécurisé (Scan)
CREATE INDEX idx_qr_codes_secure_token ON qr_codes(secure_token);

-- Liaison propriétaire-véhicule
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);

-- Recherche d'utilisateurs par email et rôle
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Tri et filtrage des historiques et journaux d'audit par date
CREATE INDEX idx_vehicle_history_date ON vehicle_modification_history(modified_at);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- ============================================================================
-- DECLARATION DES TRIGGERS POUR L'AUDIT AUTOMATIQUE DES VÉHICULES
-- ============================================================================

CREATE OR REPLACE FUNCTION log_vehicle_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Comparer les champs clés et enregistrer l'historique
        IF OLD.plate_number IS DISTINCT FROM NEW.plate_number THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'plate_number', OLD.plate_number, NEW.plate_number);
        END IF;
        
        IF OLD.vin IS DISTINCT FROM NEW.vin THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'vin', OLD.vin, NEW.vin);
        END IF;

        IF OLD.brand IS DISTINCT FROM NEW.brand THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'brand', OLD.brand, NEW.brand);
        END IF;

        IF OLD.model IS DISTINCT FROM NEW.model THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'model', OLD.model, NEW.model);
        END IF;

        IF OLD.color IS DISTINCT FROM NEW.color THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'color', OLD.color, NEW.color);
        END IF;

        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'status', OLD.status, NEW.status);
        END IF;
        
        IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
            INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
            VALUES (NEW.id, 'UPDATE', 'owner_id', OLD.owner_id::text, NEW.owner_id::text);
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
        VALUES (OLD.id, 'DELETE', 'ALL', OLD.plate_number, NULL);
    
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO vehicle_modification_history(vehicle_id, action_type, modified_field, old_value, new_value)
        VALUES (NEW.id, 'INSERT', 'ALL', NULL, NEW.plate_number);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicle_audit
AFTER INSERT OR UPDATE OR DELETE ON vehicles
FOR EACH ROW EXECUTE FUNCTION log_vehicle_changes();

-- ============================================================================
-- DONNÉES PAR DÉFAUT (SEEDS) POUR TESTS
-- ============================================================================

-- Rôles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Administrateur système - accès complet'),
(2, 'REGISTRATION_AGENT', 'Agent SPA - enregistrement des véhicules et gravage'),
(3, 'VERIFIER', 'Vérificateur PNC - accès en lecture et console d''interception');

-- Permissions
INSERT INTO permissions (id, name, description) VALUES
(1, 'MANAGE_USERS', 'Gérer les comptes utilisateurs'),
(2, 'WRITE_VEHICLES', 'Enregistrer et modifier les véhicules et propriétaires'),
(3, 'READ_VEHICLES', 'Consulter le registre des véhicules et propriétaires'),
(4, 'VERIFY_PIECE', 'Consulter les informations publiques via QR code');

-- Liaisons Rôles-Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- ADMIN a toutes les permissions
(2, 2), (2, 3), (2, 4),         -- Agent peut écrire, lire et vérifier
(3, 3), (3, 4);                 -- Vérificateur (PNC) peut lire et vérifier
