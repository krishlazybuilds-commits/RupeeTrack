# RupeeTrack

RupeeTrack is a personal finance tracker with a React frontend and an Express backend that is ready to serve a web client today and a phone app later.

## Project structure

- `src/` - React UI
- `backend/` - Express API with JSON file storage

## Backend features

- Transactions CRUD
- Budget read and update
- Stats and category breakdowns
- Mobile-friendly metadata endpoint at `GET /api/meta`
- Configurable CORS via `ALLOWED_ORIGINS`
- Direct API base URL support via `VITE_API_BASE_URL`

## Run locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

The frontend uses the Vite proxy by default in local web development.

## Connecting a phone app

For a real mobile app, set the backend to listen on your machine and point the app to your machine IP.

Example:

```bash
set ALLOWED_ORIGINS=*
set PORT=3001
cd backend
npm start
```

Then in the app environment:

```bash
VITE_API_BASE_URL=http://192.168.1.10:3001/api
```

Replace `192.168.1.10` with your computer's LAN IP.

## API overview

- `GET /api/health`
- `GET /api/meta`
- `GET /api/transactions?type=expense&month=2026-05&limit=20`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/stats?month=2026-05`
- `GET /api/budgets`
- `PUT /api/budgets/:category`

## Notes

Storage is currently file-based with `lowdb`. For production multi-user usage, the next step would be moving to PostgreSQL or MongoDB and adding authentication.
