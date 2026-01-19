# 📈 TradeSense AI - Professional Prop Trading Platform

**TradeSense AI** est une plateforme moderne de trading qui combine une interface immersive et une infrastructure d'analyse intelligente. Conçue pour mon examen final, elle démontre une architecture Full-Stack complète.

---

## 🚀 Fonctionnalités Clés

### 💹 Trading & Analyse
- **Landing Page Immersive** : Design futuriste avec intégration d'objets 3D et effets de verre (Glassmorphism).
- **AI-Powered Insights** : Chatbot intégré simulant une analyse de marché en temps réel.
- **Challenge System** : Parcours utilisateur pour tester les compétences de trading sur différents paliers ($50K, $100K).
- **Multi-Platform Dashboard** : Interface responsive optimisée pour Desktop et Mobile.

### 🔐 Sécurité & Backend
- **Authentification** : Gestion des sessions utilisateurs via Flask.
- **Base de données** : Stockage des profils et des performances via SQLite.
- **Architecture Découplée** : Séparation stricte entre le Frontend (React) et le Backend (Flask).

---

## 🛠️ Tech Stack

**Frontend**
- **Framework** : React.js
- **Styling** : Tailwind CSS
- **Animations** : Lucide React (Icônes), Framer Motion (Transitions)

**Backend**
- **Framework** : Flask (Python 3.11+)
- **Base de données** : SQLite / SQLAlchemy
- **API** : RESTful Architecture

---

## 📁 Structure du Projet

```text
TradeSense-AI/
├── backend/             # Serveur Flask & API
│   ├── app.py           # Point d'entrée principal
│   ├── models.py        # Modèles de base de données
│   └── requirements.txt # Dépendances Python
├── frontend/            # Application React
│   ├── src/             # Composants et Pages
│   ├── public/          # Assets et Images
│   └── package.json     # Dépendances JS
└── README.md            # Documentation
