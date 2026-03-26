# Millenium DAS Backend API

Backend API for the Millenium Digital Admin System built with Node.js, Express, and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API**
3. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key (optional, for admin operations)

### 3. Set up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Run the SQL script to create tables and seed initial data

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   HR_FRONTEND_URL=http://localhost:5174
   ```

### 5. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Stock Management

- `GET /api/stock` - Get all stock items
- `GET /api/stock/stats` - Get stock statistics
- `GET /api/stock/low-stock` - Get items below threshold
- `GET /api/stock/category/:category` - Get items by category
- `GET /api/stock/:id` - Get single item with purchase history
- `POST /api/stock` - Create new stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item
- `POST /api/stock/:id/purchase` - Add purchase and update quantity

### Health Check
- `GET /health` - Server health status

## Deployment to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from `.env`
5. Deploy!

Your API will be available at: `https://your-app.onrender.com`
