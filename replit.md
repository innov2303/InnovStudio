# Innov Studio - Site Vitrine Studio de Production Web

## Overview
Site vitrine pour un studio de production web spécialisé dans les applications entreprise et les sites vitrines avec intégration IA. Le site comprend un système d'authentification locale avec gestion des utilisateurs.

## Features
- **Page d'accueil moderne** : Hero section, services (Sites Vitrines, Applications Web, Intégration IA, Design UI/UX), avantages, Technologies Modernes
- **Authentification locale** : Login/Register avec sessions PostgreSQL
- **Compte admin par défaut** : username "admin", password "admin" (changement obligatoire à la première connexion)
- **Inscription utilisateurs** : Prénom, Nom, Entreprise, Adresse, Adresse de facturation (checkbox "identique")
- **Dashboard** : Profil utilisateur, panneau admin pour voir tous les utilisateurs
- **Mode sombre/clair** : Toggle disponible uniquement après connexion (dashboard), pages publiques toujours en mode sombre
- **Système de projets** : Demandes de projet avec suivi d'état visuel (graphique de progression avec 5 étapes)
- **Suivi des fonctionnalités** : Les clients déposent des fonctionnalités, l'admin gère les statuts (pending, in_progress, completed, blocked)
- **Gestion des fonctionnalités** : Les clients peuvent modifier ou supprimer leurs fonctionnalités tant qu'elles sont en attente
- **Gestion des documents** : Système de devis avec workflow de signature
  - Quand un projet est en "Étude", l'admin peut créer un devis
  - L'admin upload le devis → statut "En attente de signature"
  - Le client télécharge, signe et upload le document signé → statut "Signé"
- **Vérification email** : Les nouveaux utilisateurs doivent vérifier leur email avant de pouvoir se connecter
- **Mot de passe oublié** : Réinitialisation par lien envoyé par email (valide 1 heure)
- **Affichage mot de passe** : Bouton œil pour afficher/masquer les mots de passe sur tous les formulaires

## Tech Stack
- **Frontend** : React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Express.js + TypeScript
- **Database** : PostgreSQL (Drizzle ORM)
- **Auth** : express-session + bcrypt + connect-pg-simple

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
│   │   └── theme-toggle.tsx  # Dark/light mode toggle
│   ├── lib/
│   │   ├── auth.tsx          # Auth context provider
│   │   └── queryClient.ts
│   └── App.tsx               # Routes
server/
├── routes.ts                 # API endpoints
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
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Utilisateur courant
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/change-password` - Changer mot de passe
- `GET /api/users` - Liste utilisateurs (admin only)
- `POST /api/projects` - Créer un projet
- `GET /api/projects` - Liste des projets (user: ses projets, admin: tous)
- `PATCH /api/projects/:id/status` - Mettre à jour statut projet (admin only)
- `POST /api/projects/:projectId/features` - Ajouter une fonctionnalité (owner only)
- `GET /api/projects/:projectId/features` - Liste fonctionnalités d'un projet
- `PATCH /api/features/:id/status` - Mettre à jour statut fonctionnalité (admin only)
- `PATCH /api/features/:id` - Modifier fonctionnalité (owner only, si pending)
- `DELETE /api/features/:id` - Supprimer fonctionnalité (owner only, si pending)
- `GET /api/auth/verify-email` - Vérifier email avec token
- `POST /api/auth/resend-verification` - Renvoyer email de vérification
- `POST /api/auth/forgot-password` - Demander réinitialisation mot de passe
- `POST /api/auth/reset-password` - Réinitialiser mot de passe avec token
- `GET /api/projects/:projectId/documents` - Liste des documents d'un projet
- `POST /api/projects/:projectId/documents` - Créer un document (admin only)
- `POST /api/documents/:id/upload-quote` - Admin upload le devis
- `POST /api/documents/:id/upload-signed` - Client upload le document signé
- `GET /api/documents/:id/download` - Télécharger un document
- `PATCH /api/documents/:id/status` - Modifier statut document (admin only)

## Environment Variables
- `DATABASE_URL` - URL PostgreSQL
- `SESSION_SECRET` - Clé de session

## User Schema
```typescript
{
  id: string,
  username: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  company: string,
  address: string,
  billingAddress: string,
  sameAsBilling: boolean,
  role: "user" | "admin",
  mustChangePassword: boolean
}
```

## Running
```bash
npm run dev          # Development
npm run db:push      # Sync database schema
```
