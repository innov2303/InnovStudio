# Innov Studio - Site Vitrine Studio de Production Web

## Overview
Site vitrine pour un studio de production web spécialisé dans les applications entreprise et les sites vitrines avec intégration IA. Le site comprend un système d'authentification locale avec gestion des utilisateurs.

## Features
- **Page d'accueil moderne** : Hero section, services (Sites Vitrines, Applications Web, Intégration IA, Design UI/UX), avantages, Technologies Modernes
- **Authentification locale** : Login/Register avec sessions PostgreSQL
- **Compte admin par défaut** : email "admin@innov-studio.fr", password "admin" (changement obligatoire à la première connexion)
- **Inscription utilisateurs** : Prénom, Nom, Entreprise, Adresse, Adresse de facturation (checkbox "identique")
- **Dashboard** : Profil utilisateur, panneau admin pour voir tous les utilisateurs
- **Mode sombre/clair** : Toggle disponible uniquement après connexion (dashboard), pages publiques toujours en mode sombre
- **Système de projets** : Demandes de projet avec suivi d'état visuel (graphique de progression avec 8 étapes : Déposé → Étude → Signature → Validé → Phase 1 → Phase 2 → Règlement → Terminé)
- **Suivi des fonctionnalités** : Les clients déposent des fonctionnalités, l'admin gère les statuts (pending, in_progress, completed, blocked)
- **Gestion des fonctionnalités** : Les clients peuvent modifier ou supprimer leurs fonctionnalités tant qu'elles sont en attente
- **Gestion des documents** : Système de devis avec workflow de signature
  - Quand un projet est en "Étude", l'admin peut créer un devis
  - Système de prestations : lignes multiples avec description et montant individuel (stockées en JSON)
  - Pourcentage d'acompte configurable avec calcul automatique
  - Génération PDF professionnelle avec tableau des prestations
  - Prévisualisation du devis avant génération
  - L'admin génère et télécharge le PDF du devis
  - Le client télécharge, signe et upload le document signé → statut "Signé"
  - Bouton "Télécharger" uniforme sur tous les documents
- **Signature électronique admin** : 
  - Pad de signature dans les paramètres pour dessiner la signature (canvas avec support souris/tactile)
  - Signature sauvegardée en base64 PNG dans la base de données
  - Signature automatiquement intégrée dans tous les PDF de devis générés (zone "Pour Innov Studio")
- **Signature électronique client** :
  - Le client peut choisir entre signer électroniquement OU uploader un PDF signé
  - Dialog de signature avec pad de signature canvas
  - Signature client sauvegardée en base64 PNG dans le document
  - Les deux signatures (admin + client) intégrées dans le PDF final
- **Paiement d'acompte Stripe** :
  - Après signature du devis, le projet passe en statut "awaiting_deposit"
  - Bouton de paiement visible pour le client sur le dashboard
  - Redirection vers Stripe Checkout pour paiement sécurisé
  - Montant calculé automatiquement depuis le pourcentage d'acompte du devis
  - Webhook Stripe pour mise à jour automatique du statut projet après paiement réussi
- **Paiement final Stripe** :
  - Après Phase 2, l'admin passe le projet en statut "awaiting_final_payment" (Règlement total)
  - Bouton de paiement vert visible pour le client sur le dashboard
  - Montant = total du devis moins l'acompte déjà payé
  - Webhook Stripe pour passage automatique en statut "completed" après paiement
- **Génération automatique de facture** :
  - À la fin du paiement final, une facture est automatiquement générée
  - Titre de la facture : "Facture - [Nom du projet]"
  - PDF de facture professionnelle avec badge "PAYÉE" vert
  - Affiche le détail des paiements (acompte + solde)
  - Visible dans les documents du projet avec icône verte
- **Projets terminés** :
  - Impossible d'ajouter de nouvelles fonctionnalités sur un projet terminé
- **Vérification email** : Les nouveaux utilisateurs doivent vérifier leur email avant de pouvoir se connecter
- **Mot de passe oublié** : Réinitialisation par lien envoyé par email (valide 1 heure)
- **Modification mot de passe par email** : Les utilisateurs connectés peuvent demander un lien par email pour modifier leur mot de passe
- **Modification email par confirmation** : Les utilisateurs peuvent changer leur adresse email via un lien de confirmation envoyé à leur email actuel
- **Affichage mot de passe** : Bouton œil pour afficher/masquer les mots de passe sur tous les formulaires
- **Système d'abonnements** : 
  - 6 offres disponibles organisées en 2 catégories :
    - **Site Vitrine** : Hébergement (39€), Support & Maintenance 7/7j (69€), Pack (89€)
    - **Application Web Entreprise** : Hébergement (79€), Support & Maintenance 7/7j (129€), Pack (179€)
  - Prix configurables par l'admin
  - Attribution des abonnements à un projet spécifique
  - Un seul abonnement actif par projet (impossible d'en prendre un autre tant que l'actif n'est pas résilié)
  - Paiement récurrent via Stripe avec renouvellement automatique mensuel
  - Email du client pré-rempli dans le checkout Stripe
  - Résiliation avec effet différé (fin de période en cours)
  - Réactivation possible avant la fin de période (annuler la résiliation)
  - Factures d'abonnement automatiques : titre "Facture - Abonnement '[Nom offre]'"
  - Historique des abonnements annulés/expirés
  - Synchronisation des prix avec Stripe
- **Logs d'activité** :
  - Système de logs complet (~20 types d'événements : auth, projets, fonctionnalités, documents, paiements, abonnements, utilisateurs)
  - Interface admin avec filtres par catégorie (Tout, Authentification, Utilisateurs, Projets, Fonctionnalités, Documents, Paiements, Abonnements)
  - Compteur de logs par catégorie, badges colorés par type
- **Analytics** :
  - Visites par jour (AreaChart), sources de trafic, pages les plus visitées
  - Exclusion automatique des visites admin
  - Chiffre d'affaires total (AreaChart factures + abonnements par mois)
  - Graphique factures projets (BarChart mensuel)
  - Graphique abonnements (BarChart mensuel)
  - Répartition des projets par statut (PieChart donut + légende)
  - Sélecteur de période (7/30/90/365 jours)
- **Sécurité** :
  - Helmet pour les headers de sécurité (CSP, X-Frame-Options, etc.)
  - Rate limiting: 10 tentatives par 15 min sur auth, 100 req/min général
  - Trust proxy configuré pour Replit et production

## Tech Stack
- **Frontend** : React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Express.js + TypeScript
- **Database** : PostgreSQL (Drizzle ORM)
- **Auth** : express-session + bcrypt + connect-pg-simple
- **Payments** : Stripe (via stripe-replit-sync pour la gestion automatique des webhooks)

## Project Structure
```
client/
├── src/
│   ├── pages/
│   │   ├── home.tsx          # Landing page
│   │   ├── login.tsx         # Login form
│   │   ├── register.tsx      # Registration form
│   │   ├── dashboard.tsx     # User dashboard + admin panel
│   │   ├── change-password.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── components/
│   │   ├── theme-toggle.tsx  # Dark/light mode toggle
│   │   └── signature-pad.tsx # Pad de signature canvas
│   ├── lib/
│   │   ├── auth.tsx          # Auth context provider
│   │   └── queryClient.ts
│   └── App.tsx               # Routes
server/
├── routes.ts                 # API endpoints
├── webhookHandlers.ts        # Stripe webhook handlers
├── stripeClient.ts           # Stripe client configuration
├── storage.ts                # Database operations
├── db.ts                     # PostgreSQL connection
└── index.ts
shared/
└── schema.ts                 # Data models + validation
```

## Routes
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Dashboard utilisateur
- `/change-password` - Changement de mot de passe
- `/forgot-password` - Demande de réinitialisation mot de passe
- `/reset-password` - Nouveau mot de passe (avec token)

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Utilisateur courant
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/change-password` - Changer mot de passe
- `GET /api/auth/verify-email` - Vérifier email avec token
- `POST /api/auth/resend-verification` - Renvoyer email de vérification
- `POST /api/auth/forgot-password` - Demander réinitialisation mot de passe
- `POST /api/auth/reset-password` - Réinitialiser mot de passe avec token
- `POST /api/auth/save-signature` - Enregistrer signature admin (admin only)

### Utilisateurs
- `GET /api/users` - Liste utilisateurs (admin only)

### Projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects` - Liste des projets (user: ses projets, admin: tous)
- `PATCH /api/projects/:id/status` - Mettre à jour statut projet (admin only)

### Fonctionnalités
- `POST /api/projects/:projectId/features` - Ajouter une fonctionnalité (owner only)
- `GET /api/projects/:projectId/features` - Liste fonctionnalités d'un projet
- `PATCH /api/features/:id/status` - Mettre à jour statut fonctionnalité (admin only)
- `PATCH /api/features/:id` - Modifier fonctionnalité (owner only, si pending)
- `DELETE /api/features/:id` - Supprimer fonctionnalité (owner only, si pending)

### Documents
- `GET /api/projects/:projectId/documents` - Liste des documents d'un projet
- `POST /api/projects/:projectId/documents` - Créer un document (admin only)
- `POST /api/documents/:id/upload-quote` - Admin upload le devis
- `POST /api/documents/:id/upload-signed` - Client upload le document signé
- `POST /api/documents/:id/sign-electronic` - Client signe électroniquement
- `GET /api/documents/:id/download` - Télécharger un document
- `GET /api/documents/:id/generate-pdf` - Générer PDF du devis
- `GET /api/documents/:id/generate-invoice-pdf` - Générer PDF de facture
- `PATCH /api/documents/:id/status` - Modifier statut document (admin only)
- `DELETE /api/documents/:id` - Supprimer un document

### Paiements Stripe
- `GET /api/stripe/config` - Récupérer la clé publique Stripe
- `POST /api/projects/:projectId/pay-deposit` - Session de paiement pour l'acompte
- `POST /api/projects/:projectId/pay-final` - Session de paiement final
- `POST /api/stripe/webhook` - Webhook Stripe pour notifications

### Abonnements
- `GET /api/subscription-offers` - Liste des offres d'abonnement
- `PATCH /api/subscription-offers/:type` - Modifier prix d'une offre (admin only)
- `POST /api/subscriptions/checkout` - Créer session checkout abonnement
- `POST /api/subscriptions` - Créer abonnement (legacy)
- `GET /api/subscriptions` - Liste des abonnements de l'utilisateur
- `GET /api/admin/subscriptions` - Liste tous les abonnements (admin only)
- `PATCH /api/subscriptions/:id/cancel` - Résilier un abonnement
- `PATCH /api/subscriptions/:id/reactivate` - Réactiver un abonnement (annuler résiliation)

## Environment Variables
- `DATABASE_URL` - URL PostgreSQL
- `SESSION_SECRET` - Clé de session
- Variables Stripe (gérées automatiquement par l'intégration)

## User Schema
```typescript
{
  id: string,
  username: string,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  company: string,
  address: string,
  billingAddress: string,
  sameAsBilling: boolean,
  role: "user" | "admin",
  mustChangePassword: boolean,
  emailVerified: boolean,
  signature: string (base64 PNG, admin only)
}
```

## Subscription Schema
```typescript
{
  id: string,
  userId: string,
  projectId: string,
  offerType: "hosting_vitrine" | "maintenance_vitrine" | "pack_vitrine" | "hosting_enterprise" | "maintenance_enterprise" | "pack_enterprise",
  monthlyPrice: string,
  status: "active" | "cancelled" | "expired",
  stripeSubscriptionId: string,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean,
  createdAt: Date
}
```

## Running
```bash
npm run dev          # Development
npm run db:push      # Sync database schema
```
