# MassageFlow - SaaS pour Massothérapeutes

Application web moderne pour la gestion complète de l'activité de massage : clients, rendez-vous, fiches de santé, reçus d'assurance et plus.

## Stack Technique

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PDF**: jsPDF avec jspdf-autotable
- **Dates**: date-fns avec locale française
- **UI Components**: lucide-react, react-hot-toast
- **Déploiement**: Vercel

## ✨ Fonctionnalités MVP (9 features)

### 1. 🔐 Authentification
- Inscription et connexion sécurisées
- Mode démo pour tests rapides
- Récupération de mot de passe

### 2. 📊 Tableau de bord
- Statistiques en temps réel (RDV, revenus, nouveaux clients)
- Actions rapides pour accès rapide
- Détection automatique des nouveaux clients
- Suggestions pour créer les clients détectés

### 3. 👥 Gestion des clients
- CRUD complet (créer, lire, modifier, supprimer)
- Recherche et filtrage
- Historique des RDV par client
- Informations de santé et allergies

### 4. 📅 Calendrier/Agenda
- Vues jour, semaine, mois
- Création et modification de RDV
- Gestion des statuts (confirmé, annulé, terminé)
- Détection des conflits d'horaires
- Temps tampon entre RDV configurable

### 5. 📝 Fiches de séance
- Notes post-massage détaillées
- Zones traitées et zones douloureuses
- Recommandations de suivi
- Historique complet par client

### 6. 🧾 Génération de factures PDF
- Factures professionnelles
- Intégration TVA automatique
- Signature numérique
- Export et téléchargement

### 7. 🔔 Notifications
- Toasts de confirmation en temps réel
- Rappels automatiques
- Alertes pour nouveaux RDV

### 8. ⚙️ Paramètres/Settings
- Profil thérapeute (nom, bio, photo)
- Informations entreprise (adresse, téléphone)
- Tarification et TVA
- Disponibilités et temps tampon
- Réseaux sociaux (Instagram)
- Logo d'entreprise

### 9. 🌐 Interface de réservation client
- **Page publique** `/booking` pour clients
- **Réservation en ligne** en 4 étapes :
  - 📅 Sélection de date
  - 👤 Informations personnelles
  - 🏥 Fiche santé obligatoire
  - ✅ Confirmation
- **Page de présentation** `/about` du thérapeute
  - Bio professionnelle
  - Spécialités
  - Coordonnées
  - Lien Instagram
- **Détection de nouveaux clients** automatique

## 🏥 Fiche santé client

**Collectée obligatoirement lors de la réservation :**
- Douleurs actuelles
- Zones sensibles
- Conditions médicales
- Grossesse (oui/non)
- Niveau de stress (1-10)
- Objectif du massage (relaxation/douleur/récupération)
- Notes supplémentaires

Enregistrée dans les données du RDV pour adaptation du massage.

## 🚀 Utilisation

### Installation
```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Mode démo
L'application fonctionne automatiquement en **mode démo** sans Supabase :
- Connexion rapide sans vérification
- Données simulées pour démonstration
- Tout fonctionne localement

### Configuration Supabase (optionnel)
Créer `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé
```

## 📱 Pages et routes

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/forgot-password` | Réinitialiser mot de passe |
| `/about` | **Profil public du thérapeute** |
| `/booking` | **Interface de réservation client** |
| `/dashboard` | Tableau de bord thérapeute |
| `/dashboard/clients` | Gestion des clients |
| `/dashboard/calendar` | Calendrier/Agenda |
| `/dashboard/invoices` | Factures PDF |
| `/dashboard/settings` | Paramètres |

## 🎯 Flux de réservation client

1. Client accède à `/booking`
2. Sélectionne date et horaire disponible
3. Remplit ses coordonnées
4. **Complète la fiche santé** (obligatoire)
5. Reçoit confirmation par email
6. **Thérapeute voit le RDV** dans le calendrier
7. **Nouveau client détecté** → suggestion de création

## 📦 Structure du projet

```
src/
├── app/                  # Pages Next.js
│   ├── (auth)/          # Pages d'authentification
│   ├── (dashboard)/     # Pages tableau de bord
│   ├── booking/         # Page de réservation client
│   ├── about/           # Page de présentation thérapeute
│   └── globals.css      # Styles globaux
├── lib/                 # Utilitaires
│   ├── supabase.ts      # Client Supabase
│   └── mock-data.ts     # Données de démo
├── types/               # Types TypeScript
│   └── index.ts         # Interfaces et constantes
└── components/          # Composants réutilisables (à ajouter)
```

## 💡 Points clés

- **Responsive design** : fonctionne sur desktop et mobile
- **Mode démo** : aucune configuration requise
- **Validation** : côté client + validation types
- **Accessibilité** : design pensé pour l'UX
- **Performance** : composants optimisés
- **Localisation** : dates en français (date-fns/fr)

## 🔄 Flux de données simplifié

```
Client réserve via /booking
    ↓
Fiche santé collectée
    ↓
Rendez-vous créé
    ↓
Thérapeute voit dans calendrier
    ↓
Nouveau client détecté
    ↓
Suggestion : ajouter à la base
    ↓
RDV prêt pour séance
```

## ✅ TODO pour production

- [ ] Connecter Supabase réellement
- [ ] Implémentation email de confirmation
- [ ] SMS de rappel
- [ ] Paiement en ligne
- [ ] Export calendrier (iCal)
- [ ] Application mobile
- [ ] Intégration Google Calendar
- [ ] API publique pour sites tiers

## License

MIT