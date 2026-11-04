# 🌟 LinguaNet AI - AI English Tutor

Applicazione web full-stack per l'apprendimento e il perfezionamento della lingua inglese con un tutor AI interattivo, feedback grammaticale in tempo reale, tracking dei progressi e supporto multi-dispositivo su rete Wi-Fi/locale.

---

## 📁 Struttura del Repository

Il repository è stato ristrutturato in maniera modulare e ordinata:

```text
PROJECT-CHAT/
├── src/                     # Frontend React 19 + TypeScript + Tailwind CSS
│   ├── components/          # Componenti UI (Chat, Sidebar, Settings, Onboarding, Admin)
│   ├── services/            # Client API (Axios + AI service)
│   ├── store/               # Gestione stato globale con Zustand
│   ├── assets/              # Icone e grafica applicativa
│   ├── App.tsx              # Componente principale
│   └── main.tsx             # Entrypoint React
├── server/                  # Backend Node.js Express + SQLite
│   ├── routes/              # Endpoint API (auth, data, ai, admin)
│   ├── middleware/          # Autenticazione JWT e ruoli
│   ├── scripts/             # Script di utilità e manutenzione database
│   ├── db.js                # Inizializzazione e schema database SQLite
│   ├── database.sqlite      # Database locale SQLite
│   └── index.js             # Entrypoint server Express
├── public/                  # Asset pubblici statici (favicon.png, favicon.svg)
├── design-assets/           # Archivio risorse grafiche, loghi e prototipi v0
├── tests/                   # Suite di test d'integrazione automatizzata
│   └── run-all-tests.cjs    # Test runner end-to-end
├── .env.example             # Modello configurazione variabili d'ambiente
├── .env                     # File variabili d'ambiente locale
├── package.json             # Script e dipendenze root
├── vite.config.ts           # Configurazione Vite con proxy host e Wi-Fi
└── tsconfig.json            # Configurazione TypeScript
```

---

## 🚀 Guida Rapida all'Avvio

### 1. Installazione Dipendenze
All'interno della cartella principale del progetto:
```bash
npm install
cd server && npm install
```

### 2. Configurazione `.env`
Crea o modifica il file `.env` nella root del progetto:
```env
# Chiave API Google Gemini (da Google AI Studio: https://aistudio.google.com/)
VITE_GOOGLE_GEMINI_API_KEY=LA_TUA_CHIAVE_API_QUI

# Modello preferito (opzionale, default: gemini-3.8-flash)
# Modelli veloci supportati: gemini-3.8-flash, gemini-3.7-flash, gemini-3.6-flash, gemini-3.5-flash-lite, gemini-2.5-flash
GEMINI_MODEL=gemini-3.8-flash

# Porta del server (default: 3001)
PORT=3001

# Chiave segreta JWT per le sessioni utente
JWT_SECRET=linguanet-secret-key-2026
```

> **Nota sul Tutor AI**: Se la chiave Gemini non è impostata o non è valida, l'applicazione non si blocca ma attiva automaticamente la **Modalità Tutor Locale Dimostrativa**, garantendo che la chat, il punteggio grammaticale e l'estrazione dei vocaboli funzionino sempre per i test!

### 3. Avvio dell'Applicazione
Per avviare sia il server backend che il client frontend contemporaneamente:
```bash
npm run start:all
```

Oppure in terminali separati:
```bash
# Terminale 1 - Backend
npm run server

# Terminale 2 - Frontend
npm run dev
```

---

## 📶 Collegamento Wi-Fi e Accesso da Mobile

L'applicazione è configurata per essere accessibile da qualsiasi smartphone, tablet o computer collegato alla stessa rete Wi-Fi.

All'avvio del server, nel terminale comparirà automaticamente l'indirizzo IP locale della tua rete:
```text
======================================================
🚀 LinguaNet AI Server in esecuzione!
📡 Backend locale:   http://localhost:3001
📶 Backend Wi-Fi/LAN: http://192.168.1.XXX:3001
💻 Frontend Wi-Fi/LAN: http://192.168.1.XXX:5173
======================================================
```

Per accedere da telefono o tablet:
1. Assicurati che il dispositivo sia collegato allo **stesso Wi-Fi** del computer.
2. Apri il browser del telefono (Safari, Chrome, ecc.).
3. Naviga all'indirizzo del frontend indicato (es. `http://192.168.1.XXX:5173`).
4. Tutte le richieste API verranno inoltrate automaticamente al backend tramite il proxy Vite.

---

## 🔑 Credenziali Predefinite

Il database include utenti preconfigurati per i test:

| Ruolo | Username | Password |
|---|---|---|
| **Super Admin** | `admin` *(o `Admin`)* | `Admin` |
| **Utente Test** | `andrea` | (impostata al momento della registrazione) |

È possibile registrare nuovi account liberamente dalla schermata di login.  
Il pannello di amministrazione è accessibile da account admin all'indirizzo `/admin`.

---

## 🧪 Test e Manutenzione

Tutti i test e i controlli di qualità possono essere eseguiti con i comandi dedicati:

```bash
# Esegue tutti i controlli: lint + build + test d'integrazione
npm run test:all

# Esegue la suite di test end-to-end (17 test su API, auth, data, AI, admin)
npm test

# Verifica conformità TypeScript e build per la produzione
npm run build

# Verifica linting ESLint
npm run lint

# Script manutenzione database
npm run db:check    # Verifica utente admin nel database
npm run db:reset    # Reset completo del database SQLite
```
