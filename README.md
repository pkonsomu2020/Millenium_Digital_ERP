# Millenium Digital Admin System

This is the central codebase for the Millenium Digital Admin System (DAS). The system provides structured management for Millenium Solutions Ltd's daily office operations.

## 🎯 Project Status

### ✅ Completed Modules
- **Stock Management** - Full backend + frontend integration with 47 real items from Excel data

### 🚧 In Progress
- Document Vault
- Leave Requests
- Meetings
- Dashboard Analytics

## Core Features
1. **Dynamic Executive Dashboard**: At-a-glance visualization of low stock alerts, pending leave, upcoming meetings, and monthly organization spend.
2. **Smart Inventory & Stock Management**: Digital tracking of office consumables (Date of Purchase, Item Name, Quantity, Unit Price) - **NOW LIVE WITH BACKEND**
3. **Universal Document Vault**: Secure, categorized storage and versioning for meeting minutes, company policies, and generic office records.
4. **HR & Leave Workflow**: Streamlines employee leave requests (Sick, Annual, Casual) mapped directly to HR for approvals.
5. **Meeting & Calendar Scheduler**: Intelligent calendar view to track intra-office meetings, with automated email invitations and reminders.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS v4 + Recharts
- Backend: Node.js (Express) + Supabase (PostgreSQL)
- Deployment: Render (Backend + Frontend)

## 🚀 Quick Start

### Stock Management Module (Complete)

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your Supabase credentials to .env
   npm run dev
   ```

2. **Setup Admin Dashboard**
   ```bash
   npm install
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:3000/api
   npm run dev
   ```

3. **Setup HR Dashboard**
   ```bash
   cd HR-Management
   npm install
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:3000/api
   npm run dev
   ```

📚 **Detailed Instructions**: See `QUICK_START.md` or `SETUP_GUIDE.md`

## 📁 Project Structure

```
millenium-das/
├── backend/                    # Node.js + Express API
│   ├── config/                 # Supabase configuration
│   ├── controllers/            # Business logic
│   ├── routes/                 # API endpoints
│   ├── database/               # SQL schema + seed data
│   └── scripts/                # Utility scripts
├── src/                        # Admin Dashboard (React)
│   ├── app/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   └── providers/          # Context providers
│   └── services/               # API service layer
├── HR-Management/              # HR Dashboard (React)
│   └── src/                    # Same structure as Admin
└── public/                     # Static assets
```

## 🗄️ Database

**Provider**: Supabase (PostgreSQL)

**Tables**:
- `stock_items` - 47 items across 5 categories
- `purchase_history` - Purchase tracking with dates and prices
- `water_deliveries` - Water bottle delivery log

## 📖 Documentation

- `QUICK_START.md` - Get running in 5 minutes
- `SETUP_GUIDE.md` - Complete setup instructions
- `DEPLOYMENT_CHECKLIST.md` - Production deployment guide
- `backend/API_DOCUMENTATION.md` - API reference
- `backend/ARCHITECTURE.md` - System architecture
- `STOCK_MANAGEMENT_COMPLETE.md` - Module completion summary

## 🔐 Access Control

### Admin Dashboard
- Full CRUD operations on all modules
- Add/Edit/Delete stock items
- Approve/Reject leave requests
- Schedule meetings
- Upload documents

### HR Dashboard
- Read-only stock oversight
- Full leave request management
- Read-only document access
- View-only meeting calendar

## 🌐 Live URLs (After Deployment)

- Backend API: `https://your-backend.onrender.com`
- Admin Dashboard: `https://your-admin.onrender.com`
- HR Dashboard: `https://your-hr.onrender.com`

## 🛠️ Development

```bash
# Backend
cd backend && npm run dev

# Admin Dashboard
npm run dev

# HR Dashboard  
cd HR-Management && npm run dev
```

## 📊 Stock Management Features

### Admin Dashboard (Full Access)
✅ 47 real items from Excel file
✅ 5 categories (Kitchen, Washroom, Snacks, Water, Kitchen Stock)
✅ **Add new items** with full details
✅ **Edit existing items** (name, quantity, threshold, etc.)
✅ **Record purchases** with dates and prices
✅ **Delete items** with confirmation
✅ Low stock alerts
✅ Search & filter
✅ Real-time statistics
✅ Purchase history tracking

### HR Dashboard (Read-Only)
✅ View all stock items
✅ Monitor low stock alerts
✅ Search & filter
✅ View statistics
❌ Cannot add/edit/delete items