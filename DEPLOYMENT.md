# AI Franchise Connect — Deployment Guide
## Stack: MongoDB Atlas · Render (backend) · Vercel (frontend)

---

## Step 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://cloud.mongodb.com) → **Create a free cluster** (M0 Sandbox is free).
2. Under **Database Access** → Add a database user with a strong password.
3. Under **Network Access** → Add IP Address → choose **Allow access from anywhere** (`0.0.0.0/0`) so Render can connect.
4. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password. **Save this string** — you'll need it in Step 2.

---

## Step 2 — Render (Backend)

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo and select it.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements-render.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add all of these:

   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | your Atlas connection string from Step 1 |
   | `DB_NAME` | `franchise_db` |
   | `JWT_SECRET` | any long random string (e.g. `openssl rand -hex 32`) |
   | `JWT_ALGORITHM` | `HS256` |
   | `JWT_EXPIRY_DAYS` | `7` |
   | `GROQ_API_KEY` | your key from [console.groq.com](https://console.groq.com) |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` |
   | `ALLOWED_ORIGINS` | *(leave blank for now — fill in after Vercel deploy in Step 4)* |

5. Click **Deploy**. Wait for it to go green.
6. Copy your Render URL — it looks like `https://ai-franchise-connect-backend.onrender.com`.

---

## Step 3 — Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
3. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | your Render URL from Step 2 (e.g. `https://ai-franchise-connect-backend.onrender.com`) |

4. Click **Deploy**. Wait for it to finish.
5. Copy your Vercel URL — it looks like `https://ai-franchise-connect.vercel.app`.

---

## Step 4 — Connect Backend CORS to Frontend

Now that you have the Vercel URL, go back to Render:

1. **Render Dashboard → your service → Environment**.
2. Set `ALLOWED_ORIGINS` to your Vercel URL:
   ```
   https://ai-franchise-connect.vercel.app
   ```
3. Click **Save Changes** — Render will auto-redeploy.

---

## Step 5 — Verify Everything Works

Test these URLs in your browser / Postman:

| Check | URL |
|-------|-----|
| Backend health | `https://<render-url>/api/franchises?limit=3` |
| Frontend loads | `https://<vercel-url>` |
| Auth works | Register a new account on the live site |

---

## Local Development (unchanged)

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
pip install -r requirements-render.txt
uvicorn server:app --reload --port 8000

# Frontend (in a new terminal)
cd frontend
cp .env.example .env   # REACT_APP_BACKEND_URL=http://localhost:8000
yarn install
yarn start
```

---

## Notes

- **Render free tier** spins down after 15 min of inactivity — first request after sleep takes ~30s. Upgrade to Starter ($7/mo) to avoid this.
- **MongoDB Atlas M0** is free forever with 512MB storage — plenty for this app.
- **Vercel free tier** is unlimited for hobby projects.
- The app auto-seeds franchise data on first startup (the `seed()` function in `server.py`).
