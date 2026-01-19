# 📈 TradeSense AI - Professional Prop Trading Platform

**TradeSense AI** est une plateforme moderne de trading qui combine une interface immersive et une infrastructure d'analyse intelligente. Conçue pour mon examen final, elle démontre une architecture Full-Stack complète.

---



## 🌍 Live Demo
**Frontend (Interface Utilisateur)** : https://trade-sense-ai-xi.vercel.app/

**Backend (API & Scraping)** : https://tradesense-ai-production-cf79.up.railway.app/


---

## 🚀 Fonctionnalités Clés

### 💹 Trading & Analyse
*  **Landing Page Immersive** : Design futuriste avec intégration d'objets 3D et effets de verre (Glassmorphism).
*  **Real-Time Market Data** : Récupération dynamique des prix via scraping (Itissalat Al-Maghrib) et API financières (yfinance).
*  **Challenge System**  : Parcours utilisateur pour tester les compétences de trading sur différents paliers ($50K, $100K).
*  **Multi-Platform Dashboard** : Interface responsive optimisée pour Desktop et Mobile. : Interface responsive optimisée pour Desktop et Mobile.

  
---


### 🔐 Sécurité & Infrastructure Cloud
* **Authentification** : Gestion des sessions utilisateurs via Flask.
* **Base de données** : Utilisation de PostgreSQL managé sur Railway pour la production.
* **Architecture Découplée** : Séparation stricte entre le Frontend (Vercel) et le Backend (Railway).

---

## 🛠️ Tech Stack

**Frontend**
*  **Framework** : React.js
*  **Styling** : Tailwind CSS
*  **Animations** : Lucide React (Icônes), Framer Motion (Transitions)
*  **Hosting** : Vercel (CI/CD intégré via GitHub)

**Backend**
*  **Framework** : Flask (Python 3.13)
*  **Serveur WSGI** : Gunicorn (Production-ready)
*  **Scraping & Data** : Selenium / Beautiful Soup (Données locales), yfinance (Données internationales)
*  **API** : Architecture RESTful pour la communication Frontend-Backend

**Database & Cloud**
*  **Base de données** : PostgreSQL (Production sur Railway), SQLite (Développement local)
*  **ORM** : SQLAlchemy (Gestion des modèles et migrations)
*  **Cloud Infrastructure** : Railway (Hébergement du moteur Python et de la base de données managée)

---


```text
## 📁 Structure du Projet

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
```
### 💻 Développement
**Backend (Flask)**
Bash

cd backend
python app.py
**Frontend (React)**
Bash

cd frontend
npm install
npm run dev


---


### 📈 Roadmap (Étapes du Projet)
**[x] Phase 1** : Fondations

Architecture Backend Flask et API REST.

Intégration de la Landing Page React.

Configuration de la base de données SQLite.

**[ ] Phase 2** : Authentification (En cours)

Système d'inscription et de connexion.

Gestion des tokens de session.

**[ ] Phase 3** : Dashboard Avancé

Graphiques de performance en temps réel.

Historique des trades simulés.


---


### 🐛 Limitations Actuelles
Données de Marché : Les graphiques utilisent actuellement des données simulées pour la démonstration.

**IA** : Le chatbot simule une analyse intelligente (logique pré-programmée).

**Paiements** : Le système de checkout est une simulation visuelle (pas de transactions réelles).


---


### 📄 Licence & Disclaimer
Ce projet est réalisé dans un cadre pédagogique pour l'examen final.

Licence : MIT

Avertissement : Cette plateforme est une simulation et ne doit pas être utilisée pour du trading réel avec de l'argent véritable.


---


## 📞 Contact
**Auteur** : Ikram Essouiri

**GitHub** : ikramessouiri


---


**Construit avec ❤️ par l'équipe TradeSense AI.**
