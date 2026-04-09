# WK Calendar 4 All

This repository is now split into two apps:

- `backend/`: Laravel app with Docker/Sail
- `frontend/`: standalone React app powered by Vite

## Backend

Run the Laravel backend from `backend/`:

```bash
cd backend
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

Default backend ports:

- App: `http://localhost:8001`
- MySQL: `3307`

## Frontend

Run the React frontend from `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Default frontend port:

- App: `http://localhost:5173`
