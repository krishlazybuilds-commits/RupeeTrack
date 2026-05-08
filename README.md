# RupeeTrack

RupeeTrack is a mobile-first personal finance tracker for recording income, expenses, budgets, and spending trends. It includes a React/Vite frontend, an Express backend with JSON-file storage, and a Capacitor Android project for building APKs.

## Features

- Add income and expense transactions
- Category-based transaction tracking
- Custom categories with delete confirmation
- Monthly budget tracking
- Dashboard summary cards and spending chart
- Recent transaction list with delete/delete-all actions
- Theme support
- Android-ready Capacitor project

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend:** Node.js, Express, LowDB
- **Mobile:** Capacitor Android
- **Tooling:** ESLint, Gradle wrapper

## Project structure

```text
RupeeTrack/
├── src/                 # React frontend source
├── public/              # Static frontend assets
├── backend/             # Express API and JSON storage layer
├── android/             # Capacitor Android native project
├── scripts/             # Development helper scripts
├── capacitor.config.json
├── package.json
└── vite.config.js
```

## Prerequisites

Install these before running the project:

- Node.js 20+
- npm
- Android Studio or Android SDK, only needed for APK builds
- Java/JDK compatible with the Android Gradle plugin

## Setup

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

## Run locally

Run frontend and backend together:

```bash
npm start
```

Or run them separately:

```bash
npm run dev
npm run dev:backend
```

The frontend uses the Vite dev server. The backend runs on port `3001` by default.

## Build web app

```bash
npm run build
```

The production web build is written to `dist/`.

## Build Android APK

Build web assets, sync Capacitor, then assemble a debug APK:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows:

```bat
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

The debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Backend scripts

From the `backend/` folder:

```bash
npm run dev      # Start backend in watch mode
npm start        # Start backend normally
npm test         # Run backend tests
```

## API overview

Base URL in local development:

```text
http://localhost:3001/api
```

Common endpoints:

- `GET /api/health`
- `GET /api/meta`
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `DELETE /api/transactions`
- `GET /api/stats`
- `GET /api/budgets`
- `PUT /api/budgets/:category`
- `DELETE /api/budgets`

## Environment variables

Frontend:

```text
VITE_API_BASE_URL=http://localhost:3001/api
```

Backend:

```text
PORT=3001
ALLOWED_ORIGINS=*
```

For testing on a phone over LAN, set `VITE_API_BASE_URL` to your computer's local IP address, for example:

```text
VITE_API_BASE_URL=http://192.168.1.10:3001/api
```

## Data storage

The backend currently uses file-based storage through LowDB. The generated database file is:

```text
backend/db.json
```

This file is ignored by Git because it contains local runtime data.

## Git notes

Generated files such as `node_modules/`, `dist/`, Android build outputs, APKs, logs, local environment files, and runtime database files are ignored.

## License

Private project. Add a license before publishing publicly.
