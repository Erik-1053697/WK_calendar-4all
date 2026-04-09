# WK Calendar 4 All

Laravel 11 + React web application for the FIFA World Cup 2026 schedule and match predictions.

## Architecture Overview

- [backend](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend): Laravel API with Sanctum authentication, MySQL persistence, schedule seeders, and prediction rules
- [frontend](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend): React SPA with a venue-by-date tournament wall chart
- [docker-compose.yml](/Users/erikaknaev/Code/Fun/WK_calendar-4all/docker-compose.yml): backend, frontend, nginx, MySQL, and phpMyAdmin
- [nginx/default.conf](/Users/erikaknaev/Code/Fun/WK_calendar-4all/nginx/default.conf): routes `/api` and `/sanctum` to Laravel, everything else to React

Core flow:

- Guests can browse the full World Cup 2026 schedule board.
- Registered users can save exactly one prediction per match.
- Users can lock a prediction permanently.
- Predictions close automatically once kickoff passes or the match is manually locked.

## Database Schema

Key tables:

- `users`
  - `id`, `name`, `email`, `password`, `is_admin`, timestamps
- `venues`
  - `id`, `host_market`, `city`, `stadium_name`, `country`, `timezone_name`, `display_order`, timestamps
- `matches`
  - `id`, `fifa_match_number`, `stage`, `group_name`, `match_date`
  - `kickoff_at_local`, `timezone_name`, `kickoff_at_utc`
  - `venue_id`
  - `home_team_name`, `away_team_name`
  - `home_team_slot`, `away_team_slot`
  - `round_order`, `match_order`, `is_locked`, timestamps
- `predictions`
  - `id`, `user_id`, `match_id`, `predicted_home_score`, `predicted_away_score`, `locked_at`, timestamps

Rules enforced:

- one prediction per user per match via unique index on `(user_id, match_id)`
- locked predictions cannot be edited
- predictions cannot be created or updated when `matches.is_locked = true`
- predictions cannot be created or updated after `kickoff_at_utc`

## Official Schedule Data

Seed data lives in [backend/database/data/world_cup_2026_matches.json](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/database/data/world_cup_2026_matches.json).

Source references used for the dataset:

- Official FIFA schedule PDF: [FWC26 Match Schedule (English)](https://digitalhub.fifa.com/asset/4b5d4417-3343-4732-9cdf-14b6662af407/FWC26-Match-Schedule_English.pdf)
- Official FIFA schedule update article: [Updated World Cup 2026 match schedule, venues, kick-off times](https://inside.fifa.com/media-releases/updated-world-cup-2026-match-schedule-venues-kick-off-times-104-matches)
- Official FIFA stadium information: [Stadium information details](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/stadium-information-details)

Notes:

- The official FIFA PDF publishes match dates and kick-off times in Eastern Time.
- The app stores `kickoff_at_utc` directly from that official schedule reference.
- `kickoff_at_local` and `match_date` are derived by converting the official ET kickoff into each host venue timezone.
- The dataset seeds all 104 matches and all 16 host venues.

## Laravel Backend Files

Important backend files:

- Routes: [backend/routes/api.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/routes/api.php)
- Venue model: [backend/app/Models/Venue.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Models/Venue.php)
- Match model: [backend/app/Models/TournamentMatch.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Models/TournamentMatch.php)
- Prediction model: [backend/app/Models/Prediction.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Models/Prediction.php)
- Match controller: [backend/app/Http/Controllers/Api/MatchController.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Http/Controllers/Api/MatchController.php)
- Prediction controller: [backend/app/Http/Controllers/Api/PredictionController.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Http/Controllers/Api/PredictionController.php)
- Prediction service: [backend/app/Services/Predictions/PredictionService.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/app/Services/Predictions/PredictionService.php)
- Seeder: [backend/database/seeders/WorldCupMatchSeeder.php](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/database/seeders/WorldCupMatchSeeder.php)
- Migrations: [backend/database/migrations](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/database/migrations)

API endpoints:

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/user`
- `GET /api/matches`
- `GET /api/matches/{match}`
- `GET /api/schedule`
- `GET /api/matches/{match}/predictions`
- `GET /api/matches/{match}/my-prediction`
- `POST /api/matches/{match}/prediction`
- `PUT /api/matches/{match}/prediction`
- `POST /api/matches/{match}/prediction/lock`
- `PUT /api/admin/matches/{match}/lock`
- `PUT /api/admin/matches/{match}/unlock`

## React Frontend Files

Important frontend files:

- App router: [frontend/src/App.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/App.jsx)
- Auth context: [frontend/src/context/AuthContext.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/context/AuthContext.jsx)
- API client: [frontend/src/services/api.js](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/services/api.js)
- Schedule page: [frontend/src/pages/SchedulePage.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/pages/SchedulePage.jsx)
- Schedule board: [frontend/src/components/schedule/MatchBoard.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/components/schedule/MatchBoard.jsx)
- Match card: [frontend/src/components/schedule/MatchCard.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/components/schedule/MatchCard.jsx)
- Prediction modal: [frontend/src/components/predictions/PredictionModal.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/components/predictions/PredictionModal.jsx)
- Prediction list page: [frontend/src/pages/PredictionsPage.jsx](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/pages/PredictionsPage.jsx)
- Shared formatting helpers: [frontend/src/utils/formatters.js](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/utils/formatters.js)
- Styling: [frontend/src/index.css](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/src/index.css)

UI highlights:

- top axis = local match dates
- left axis = host markets / venues
- clickable match cards inside date x location cells
- clear prediction states for no pick, saved, locked, and closed
- responsive horizontal-scroll board on smaller screens

## Seed Workflow

Demo accounts:

- `demo@wkcalendar.test` / `password`
- `admin@wkcalendar.test` / `password`

Seeder behavior:

- seeds all 16 venues
- seeds all 104 FIFA World Cup 2026 matches
- stores actual qualified teams for group-stage fixtures
- stores bracket placeholders for knockout rounds such as `2A`, `W74`, `L101`, `W101`

## Setup Instructions

Start the stack:

```bash
docker compose up --build -d
```

Seed the MySQL database used by phpMyAdmin:

```bash
docker exec wk-calendar-backend php artisan migrate:fresh --seed --no-interaction
```

Useful URLs:

- App: `http://localhost:8000`
- React dev server: `http://localhost:5173`
- MySQL host port: `3308`
- phpMyAdmin: `http://localhost:8080`

phpMyAdmin / MySQL credentials:

- Server: `db` from inside Docker, or `127.0.0.1:3308` from your host
- Database: `wk_calendar_4all`
- Username: `root`
- Password: `root`

Environment files:

- Backend env defaults: [backend/.env](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/.env)
- Backend example env: [backend/.env.example](/Users/erikaknaev/Code/Fun/WK_calendar-4all/backend/.env.example)
- Frontend example env: [frontend/.env.example](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend/.env.example)

## Verification

Confirmed locally:

- `npm run build` passed in [frontend](/Users/erikaknaev/Code/Fun/WK_calendar-4all/frontend)
- `docker exec wk-calendar-backend php artisan migrate:fresh --seed --no-interaction` passed
- `docker exec wk-calendar-backend php artisan route:list --path=api` passed
- MySQL row counts in `wk_calendar_4all`:
  - `venues = 16`
  - `matches = 104`
  - `users = 2`
