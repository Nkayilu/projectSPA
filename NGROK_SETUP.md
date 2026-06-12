# 📱 Guide — Accès Mobile via QR Code (Ngrok)

Ce guide explique comment rendre le module de vérification SPA RDC accessible
depuis un téléphone en exposant l'application locale via **Ngrok**.

---

## 🏗️ Architecture du Système

```
📱 Téléphone  ──►  Ngrok URL  ──►  Vite (port 5175)  ──►  [proxy /api]  ──►  Backend Express (port 4000)
                  (public)          (frontend React)                           (SQLite)
```

Lorsqu'un QR Code est scanné :

1. Le téléphone ouvre `https://xxxx.ngrok-free.app/verification/<token>`
2. Ngrok forward la requête vers **Vite sur le port 5175**
3. React charge la page `PublicVerification` (aucun login requis)
4. Les appels API (`/api/verify/qr/<token>`) sont **proxiés** par Vite vers le backend (port 4000)
5. La fiche véhicule s'affiche en temps réel depuis SQLite

---

## ✅ Prérequis

- Node.js installé
- Backend SPA RDC démarré sur le port `4000`
- Frontend Vite démarré sur le port `5175`
- Compte Ngrok (gratuit sur [ngrok.com](https://ngrok.com))

---

## 🚀 Démarrage Pas-à-Pas

### Étape 1 — Installer Ngrok

```bash
# macOS (Homebrew)
brew install ngrok

# Ou téléchargement direct
# https://ngrok.com/download
```

### Étape 2 — Authentifier Ngrok (une seule fois)

```bash
ngrok config add-authtoken <VOTRE_TOKEN_NGROK>
```

> Votre token est disponible sur : https://dashboard.ngrok.com/get-started/your-authtoken

### Étape 3 — Démarrer le Backend et le Frontend

Dans deux terminaux séparés :

```bash
# Terminal 1 — Backend Express (port 4000)
cd backend
npm run dev

# Terminal 2 — Frontend Vite (port 5175)
cd ..
npm run dev
```

### Étape 4 — Démarrer Ngrok sur le port FRONTEND (5175)

```bash
# ⚠️ Important : Ngrok doit pointer vers le FRONTEND (port 5175), pas le backend
ngrok http 5175
```

Vous obtiendrez une URL comme :
```
Forwarding  https://abc123ef.ngrok-free.app -> http://localhost:5175
```

### Étape 5 — Configurer l'URL Publique dans le Backend

Ouvrez le fichier `backend/.env` et renseignez votre URL Ngrok :

```env
APP_PUBLIC_URL=https://abc123ef.ngrok-free.app
```

> ⚠️ Ne pas inclure de slash `/` à la fin de l'URL.

### Étape 6 — Redémarrer le Backend

```bash
# Dans le terminal du backend (Ctrl+C puis relancer)
cd backend
npm run dev
```

Vous devriez voir dans les logs :

```
=======================================================
🦁  SPA RDC Backend v2.1 — PORT : 4000
🔗  Frontend URL  : http://localhost:5175
🌐  URL Publique  : https://abc123ef.ngrok-free.app
📱  QR Scan URL   : https://abc123ef.ngrok-free.app/verification/<token>
🛡️   Health       : http://localhost:4000/health
=======================================================
```

### Étape 7 — Tester depuis votre Téléphone

1. Depuis l'interface admin SPA (sur votre PC), **enregistrez ou ouvrez un véhicule**
2. Le QR Code contient maintenant l'URL Ngrok publique
3. **Scannez le QR Code** avec votre téléphone
4. La page de vérification s'ouvre automatiquement ✅

---

## 🔄 Mise à Jour de l'URL Ngrok

L'URL Ngrok change à chaque redémarrage (sauf avec un plan payant).

Pour mettre à jour :

1. Lancez Ngrok et copiez la nouvelle URL
2. Modifiez `backend/.env` : `APP_PUBLIC_URL=https://nouvelle-url.ngrok-free.app`
3. Redémarrez le backend : `npm run dev`
4. **Les QR Codes déjà générés restent valides** — seule l'URL dans les nouveaux QR changera
   (les anciens QR pointent vers l'ancienne URL Ngrok)

> 💡 **Astuce Pro** : Utilisez le plan payant Ngrok pour avoir une URL statique permanente.
> Ou en production, définissez `APP_PUBLIC_URL=https://votre-domaine.com`.

---

## 🧪 Tester Sans Téléphone

Vous pouvez tester directement dans le navigateur en accédant à :

```
http://localhost:5175/verification/<token>
```

Exemple avec un token existant :
```
http://localhost:5175/verification/SPA-XXXXXXXXXXXXXXXX
```

---

## ⚙️ Variables d'Environnement (`backend/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port du backend Express | `4000` |
| `FRONTEND_URL` | URL locale du frontend | `http://localhost:5175` |
| `APP_PUBLIC_URL` | URL Ngrok ou production | `https://abc123.ngrok-free.app` |

---

## 🔒 Sécurité des QR Codes

- Les QR Codes **ne contiennent jamais** d'informations véhicule
- Ils contiennent uniquement un **UUID sécurisé** (`SPA-XXXXXXXXXXXXXXXX`)
- Les données sont récupérées **en temps réel** depuis la base de données à chaque scan
- Toute modification du véhicule ou de ses documents est **immédiatement visible** sans régénérer le QR

---

## ❓ Dépannage

### Le QR Code ne s'ouvre pas sur le téléphone
- Vérifiez que Ngrok est lancé : `ngrok http 5175`
- Vérifiez que `APP_PUBLIC_URL` dans `backend/.env` correspond bien à l'URL Ngrok active
- Redémarrez le backend après chaque changement de `.env`

### La page s'affiche mais les données ne chargent pas
- Vérifiez que le **backend** (port 4000) est bien lancé
- Vérifiez les logs du backend pour des erreurs SQLite
- Assurez-vous que le proxy Vite (`/api → localhost:4000`) est actif

### Ngrok affiche une page d'avertissement
- Ngrok affiche parfois une page de confirmation pour les nouveaux visiteurs
- Cliquez sur "Visit Site" pour continuer
- Pour éviter cela, utilisez un plan Ngrok payant ou ajoutez l'en-tête `ngrok-skip-browser-warning`

### L'URL Ngrok a changé et les anciens QR ne fonctionnent plus
- Les anciens QR pointent vers l'ancienne URL Ngrok qui n'est plus active
- Il faut régénérer les QR Codes avec la nouvelle URL (supprimer et recréer les véhicules)
- **Solution permanente** : utilisez un domaine fixe en production ou le plan Ngrok payant

---

## 📋 Commandes Récapitulatives

```bash
# 1. Démarrer le backend
cd /Users/macbook/Documents/projectSPA/backend && npm run dev

# 2. Démarrer le frontend (autre terminal)
cd /Users/macbook/Documents/projectSPA && npm run dev

# 3. Démarrer Ngrok (autre terminal)
ngrok http 5175

# 4. Copier l'URL Ngrok dans backend/.env
# APP_PUBLIC_URL=https://xxxx.ngrok-free.app

# 5. Redémarrer le backend (Ctrl+C + relancer)
```
