# RentalMGR (Local Dev Setup)

## 1) Database (XAMPP + phpMyAdmin)

- Start XAMPP Control Panel → click **Start** next to both **Apache** and **MySQL**
- Open `http://localhost/phpmyadmin`
- Click **New** → create database:
  - **Database name**: `rental_manager_db`
  - **Collation**: `utf8mb4_unicode_ci`
- Click the new DB → **SQL** tab → paste and run:
  - `database/schema.sql`
- Verify the tables appear under `rental_manager_db`

## 2) Backend (FastAPI)

From repo root:

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://root:@localhost/rental_manager_db
SECRET_KEY=generate-a-long-random-string-here-256bit
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
UPLOAD_DIR=./uploads
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

Visit Swagger UI at `http://localhost:8000/docs`.

## 3) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

## Quick Reference

- Backend: `http://localhost:8000/docs`
- Frontend: Vite dev server (default `http://localhost:5173`)

