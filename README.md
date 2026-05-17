# MeetingMind — Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat-square&logo=javascript)
![CSS3](https://img.shields.io/badge/CSS3-Custom-1572B6?style=flat-square&logo=css3)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)
![jsPDF](https://img.shields.io/badge/jsPDF-Export-red?style=flat-square)

> KI-gestütztes Meeting-Management Tool mit Google Gemini AI Integration.  
> Developed as a portfolio project for IT/AI consulting applications.

---

## Features

- **KI-Analyse** — Google Gemini analysiert Protokolle und erkennt Aufgaben automatisch
- **Kalender** — Monats- und Jahresansicht aller Meetings mit Tagesdetail
- **Spracheingabe** — Diktat-Funktion für Protokolltexte via Web Speech API
- **Mehrsprachigkeit** — Deutsch / Englisch Toggle (DE/EN)
- **Dunkelmodus** — Vollständiges Dark Theme
- **PDF Export** — Meeting-Protokolle als PDF exportieren
- **Aufgaben-Übersicht** — Alle Tasks aller Meetings auf einer Seite
- **Filter & Sortierung** — Nach Status, Datum und Titel
- **Teilnehmer-Verwaltung** — Teilnehmer hinzufügen und verwalten
- **LocalStorage Persistenz** — Einstellungen und Aufgaben-Status bleiben nach Reload erhalten
- **Tastaturkürzel** — N, D, M, T, K, L, Esc, ?
- **Responsive Design** — Mobile optimiert

---

## Tech Stack

| Technologie | Verwendung |
|---|---|
| React 18 | UI Framework |
| Axios | HTTP Client für Backend-Kommunikation |
| jsPDF + html2canvas | PDF Export |
| Web Speech API | Spracheingabe / Diktat |
| CSS3 Custom | Styling ohne Framework |
| localStorage | Client-seitige Persistenz |

---

## Screenshots

### Dashboard
![Dashboard](docs/dashboard.png)

### Kalender
![Kalender](docs/calendar.png)

### Meeting Detail
![Meeting Detail](docs/meeting-detail.png)

---

## Setup & Installation

### Voraussetzungen
- Node.js 18+
- MeetingMind Backend läuft auf `http://localhost:8080`

### Installation

```bash
git clone https://github.com/suaybboncuksb-jpg/meetingmind-frontend.git
cd meetingmind-frontend
npm install
npm start
```

Die App öffnet sich unter `http://localhost:3000`.

---

## Projektstruktur
src/
├── App.js          # Hauptkomponente mit allen Features
├── App.css         # Komplettes Styling inkl. Dark Mode
└── index.js        # React Entry Point

---

## Verbindung zum Backend

Die App kommuniziert mit dem Spring Boot Backend über:

POST   /api/meetings           — Meeting erstellen
GET    /api/meetings           — Alle Meetings laden
PUT    /api/meetings/{id}      — Meeting bearbeiten
DELETE /api/meetings/{id}      — Meeting löschen
POST   /api/meetings/{id}/analyze — KI-Analyse starten

---

## Related

- [MeetingMind Backend](https://github.com/suaybboncuksb-jpg/meetingmind) — Spring Boot + PostgreSQL + Gemini AI

---

*Portfolio Projekt · Wirtschaftsinformatik · IT/KI-Beratung*