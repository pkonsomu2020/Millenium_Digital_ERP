# Deployment Guide

## Architecture

```
Vercel (Admin)          Vercel (HR)             Render (Backend)
millenium-admin         millenium-hr            millenium-backend
.vercel.app             .vercel.app             .onrender.com
     │                       │                        │
     └───────────────────────┴────────────────────────┘
                                    │
                              Supabase (DB)
```

---

## 1. Backend → Render

### Setup
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`

### Environment Variables (set in Render dashboard)
```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-admin-app.vercel.app
HR_FRONTEND_URL=https://your-hr-app.vercel.app
PORT=3000
```

> After deploy, copy your Render URL: `https://millenium-das-backend.onrender.com`

---

## 2. Admin Frontend → Vercel

### Setup
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. **Root Directory**: leave as `/` (root)
4. Framework: Vite (auto-detected)

### Environment Variables (set in Vercel dashboard)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_HR_URL=https://your-hr-app.vercel.app
```

The `vercel.json` at root handles SPA routing (all routes → index.html).

---

## 3. HR Frontend → Vercel

### Setup
1. Go to https://vercel.com → New Project
2. Import the **same** GitHub repo
3. **Root Directory**: set to `HR-Management`
4. Framework: Vite (auto-detected)

### Environment Variables (set in Vercel dashboard)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_ADMIN_URL=https://your-admin-app.vercel.app
```

The `HR-Management/vercel.json` handles SPA routing.

---

## 4. Order of Deployment

Deploy in this order:
1. **Backend (Render)** first — get the `.onrender.com` URL
2. **Admin Frontend (Vercel)** — get the admin `.vercel.app` URL
3. **HR Frontend (Vercel)** — get the HR `.vercel.app` URL
4. Go back to **Render** and update `FRONTEND_URL` and `HR_FRONTEND_URL` with the real Vercel URLs
5. Go back to **Admin Vercel** and update `VITE_HR_URL` with the real HR Vercel URL
6. Go back to **HR Vercel** and update `VITE_ADMIN_URL` with the real Admin Vercel URL

---

## 5. How Cross-App Auth Works

```
User visits Admin app → /login/hr
  → Logs in with HR credentials
  → Admin app encodes user as base64 token
  → Redirects to: https://hr-app.vercel.app/?auth=<token>
  → HR app decodes token, stores in sessionStorage
  → HR app strips ?auth param from URL
  → User lands on HR dashboard
```

Logout from HR app redirects back to `/login/hr` on the Admin app.

---

## 6. CORS

The backend already allows both frontend origins via the `FRONTEND_URL` and `HR_FRONTEND_URL` env vars. Make sure these are set correctly on Render after you have both Vercel URLs.
