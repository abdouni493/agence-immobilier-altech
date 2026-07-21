# 🏢 Agence Immobilière — Démo

Application web de gestion d'agence immobilière (location, vente, achat, gestion de biens).
**React + TypeScript + Vite + TailwindCSS + Framer Motion + Recharts + Zustand.**

> ⚠️ **Version démo — 100 % front-end, aucune base de données.**
> Toutes les données proviennent d'un jeu de constantes (`src/data/demoData.ts`) chargé
> en mémoire au démarrage. Les créations / modifications fonctionnent normalement mais
> sont perdues au rechargement de la page.

## ✨ Caractéristiques

- **Bilingue FR / العربية** avec bascule instantanée et **RTL complet** (polices Cairo/Tajawal).
- **Animations partout** (Framer Motion) : transitions de page, modaux, drawers, cascades, compteurs animés.
- **13 modules** : Tableau de bord, Locations, Ventes, Achats, Appartements, Services,
  Clients, Médiateurs, Employés, Dépenses, Caisse, Rapports, Paramètres.
- **Assistants en plusieurs étapes** pour les locations, les ventes et les achats.
- **Calendrier (timeline)** de disponibilité des biens.
- **Permissions** par employé (filtrent le menu et les actions).
- **Impression** des bons, contrats et rapports (mise en page A4).
- **Sauvegarde / restauration** JSON dans les paramètres.

## 🚀 Démarrage

```bash
npm install
npm run dev
# http://localhost:5173
```

Autres scripts : `npm run build` (production), `npm run preview`, `npm run typecheck`.

## 🔐 Connexion

- Cliquez sur **« Essayer avec un compte démo (Admin) »** sur l'écran de connexion pour
  un accès total immédiat.
- Ou saisissez les identifiants manuellement :
  - **Admin** : `admin` (ou `admin@demo.dz`) / `demo1234` — accès complet.
  - **Employé** : `amina` (ou `amina@demo.dz`) / `demo1234` — accès restreint
    (Tableau de bord, Locations, Clients, Appartements, Services) pour tester le
    filtrage par permissions.

## 📊 Données de démonstration

Définies dans `src/data/demoData.ts`, avec des dates calculées relativement au jour
courant pour que la démo reste cohérente :

4 zones · 6 catégories · 12 biens · 12 clients · 4 médiateurs · 7 services ·
12 locations (payées, impayées, en cours, en attente, annulée) · 5 ventes · 4 achats ·
6 employés · 7 catégories de dépenses · 15 dépenses · 6 maintenances · 6 mouvements de caisse.

> Pour repartir d'une base vide : **Paramètres → Réinitialiser les données**.
> Pour retrouver le jeu de démo : rechargez la page.

## 🗂️ Structure

```
src/
├── components/       # layout, ui (kit réutilisable), forms, wizards
├── pages/            # Login + 13 modules
├── store/            # appStore (Zustand, en mémoire) + selectors + hooks
├── data/             # demoData (jeu de test) + seed + constantes
├── i18n/             # contexte FR/AR + traductions
├── lib/              # utils, lookups, storage (images inline), print
├── animations.ts     # variants Framer Motion
└── design-tokens.ts  # palette & dégradés
```

## 🧱 Stack

React 18 · TypeScript · Vite 5 · TailwindCSS 3 · Framer Motion 11 · Recharts 2 ·
Zustand 5 · React Router 6 · lucide-react · date-fns · clsx · tailwind-merge.
