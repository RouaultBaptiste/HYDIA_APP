# Hydia SaaS - Gestionnaire de Mots de Passe et Notes Sécurisées

## 🚀 Description

Hydia est une application SaaS complète de gestion de mots de passe et de notes sécurisées avec authentification multi-utilisateurs et gestion d'organisations.

## 📋 Fonctionnalités

### 🔐 Gestion des Mots de Passe
- Création, modification, suppression de mots de passe
- Catégories personnalisées par utilisateur
- Chiffrement sécurisé
- Analyse de la force des mots de passe
- Export/Import de données
- Recherche avancée

### 📝 Gestion des Notes
- Création de notes avec support Markdown
- Catégories et tags
- Notes chiffrées
- Recherche dans le contenu
- Favoris et versioning

### 👥 Gestion Multi-Utilisateurs
- Authentification JWT avec Supabase
- Organisations et permissions
- Rôles utilisateurs (owner, admin, manager, user, viewer)
- Gestion des invitations

## 🏗️ Architecture

### Backend (Backendhydia/)
- **Framework**: Node.js + Express + TypeScript
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: JWT + Cookies sécurisés
- **Validation**: Zod
- **Tests**: Jest
- **Documentation**: Swagger

### Frontend (Frontend-Hydia/)
- **Framework**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **État**: React Hooks
- **Routing**: React Router
- **Build**: Vite

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Backend
```bash
cd Backendhydia
npm install
cp .env.example .env
# Configurer les variables d'environnement Supabase
npm run dev
```

### Frontend
```bash
cd Frontend-Hydia
npm install
cp .env.example .env
# Configurer l'URL de l'API backend
npm run dev
```

## 🔧 Configuration

### Variables d'environnement Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
```

### Variables d'environnement Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_ORG_ID=your_default_org_id
```

## 📊 Base de Données

Le projet utilise Supabase avec les tables principales :
- `users` - Utilisateurs
- `organizations` - Organisations
- `organization_members` - Membres des organisations
- `passwords` - Mots de passe chiffrés
- `password_categories` - Catégories de mots de passe
- `notes` - Notes sécurisées
- `note_categories` - Catégories de notes

## 🔒 Sécurité

- Chiffrement AES-256 pour les mots de passe
- JWT avec refresh tokens
- Cookies HttpOnly sécurisés
- Validation stricte des données
- Permissions granulaires par organisation
- Rate limiting et protection CORS

## 🧪 Tests

### Backend
```bash
cd Backendhydia
npm test
npm run test:coverage
```

### Tests d'intégration
```bash
node test-api-complete.js
node test-notes-simple.js
```

## 📚 API Documentation

La documentation Swagger est disponible à : `http://localhost:3001/api-docs`

### Endpoints principaux
- `POST /auth/login` - Connexion
- `GET /organizations` - Liste des organisations
- `GET /passwords` - Liste des mots de passe
- `POST /passwords` - Créer un mot de passe
- `GET /notes` - Liste des notes
- `POST /notes` - Créer une note

## 🚀 Déploiement

### Backend
- Compatible avec Heroku, Railway, Render
- Variables d'environnement requises
- Base de données Supabase

### Frontend
- Compatible avec Vercel, Netlify
- Build statique avec Vite
- Configuration des variables d'environnement

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Changelog

### Version 1.0.0
- ✅ Authentification complète avec Supabase
- ✅ Gestion des mots de passe avec chiffrement
- ✅ Gestion des notes avec Markdown
- ✅ Catégories personnalisées par utilisateur
- ✅ Interface utilisateur moderne
- ✅ API REST complète
- ✅ Tests d'intégration

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteurs

- **Baptiste Rouault** - Développement principal
- **Antoine Ronold** - Tests et validation

## 🆘 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les issues GitHub
3. Créer une nouvelle issue avec le template approprié

---

**Hydia SaaS** - Sécurisez vos données avec style ! 🔐✨
