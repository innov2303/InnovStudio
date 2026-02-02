# Innov Studio - Site Vitrine Studio de Production Web

## Overview
Site vitrine pour un studio de production web spécialisé dans les applications entreprise et les sites vitrines avec intégration IA. Le site comprend un système d'authentification locale avec gestion des utilisateurs.

## Features
- **Page d'accueil moderne** : Hero section, services (Sites Vitrines, Applications Web, Intégration IA, Design UI/UX), avantages
- **Authentification locale** : Login/Register avec sessions PostgreSQL
- **Compte admin par défaut** : username "admin", password "mot de passe" (changement obligatoire à la première connexion)
- **Inscription utilisateurs** : Prénom, Nom, Entreprise, Adresse, Adresse de facturation (checkbox "identique")
- **Dashboard** : Profil utilisateur, panneau admin pour voir tous les utilisateurs
- **Mode sombre/clair** : Toggle disponible sur toutes les pages

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
│   │   └── change-password.tsx
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

## API Endpoints
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Utilisateur courant
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/change-password` - Changer mot de passe
- `GET /api/users` - Liste utilisateurs (admin only)

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
