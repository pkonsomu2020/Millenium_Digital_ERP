# 🏗️ System Architecture - Stock Management Module

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXCEL FILE                              │
│  Updated Kitchen_and_Washroom_Essentials (1) (1).xlsx          │
│  • 5 Sheets: Kitchen, Washroom, Snacks, Water, Kitchen Stock   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Python Analysis
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA (SQL)                        │
│  backend/database/schema.sql                                    │
│  • stock_items table (47 rows)                                  │
│  • purchase_history table                                       │
│  • water_deliveries table                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Execution
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                        │
│  https://your-project.supabase.co                               │
│  • Database hosting                                             │
│  • Row Level Security                                           │
│  • Real-time subscriptions                                      │
│  • RESTful API                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Supabase Client
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND API (Express.js)                       │
│  http://localhost:3000                                          │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐        │
│  │   Routes    │→ │ Controllers  │→ │ Supabase Client│        │
│  │ stock.routes│  │stock.controller│ │  supabase.js   │        │
│  └─────────────┘  └──────────────┘  └────────────────┘        │
│                                                                 │
│  Endpoints:                                                     │
│  • GET  /api/stock                                              │
│  • GET  /api/stock/stats                                        │
│  • GET  /api/stock/low-stock                                    │
│  • POST /api/stock                                              │
│  • PUT  /api/stock/:id                                          │
│  • DELETE /api/stock/:id                                        │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
                 │ HTTP/JSON                  │ HTTP/JSON
                 ↓                            ↓
┌─────────────────────────────┐  ┌──────────────────────────────┐
│   ADMIN DASHBOARD (React)   │  │  HR DASHBOARD (React)        │
│   http://localhost:5173     │  │  http://localhost:5174       │
│                             │  │                              │
│  ┌──────────────────────┐   │  │  ┌──────────────────────┐   │
│  │ StockManagement.tsx  │   │  │  │ StockManagement.tsx  │   │
│  │  • Full CRUD access  │   │  │  │  • Read-only access  │   │
│  │  • Add/Edit/Delete   │   │  │  │  • View only         │   │
│  │  • Purchase tracking │   │  │  │  • No modifications  │   │
│  └──────────┬───────────┘   │  │  └──────────┬───────────┘   │
│             │                │  │             │                │
│  ┌──────────▼───────────┐   │  │  ┌──────────▼───────────┐   │
│  │    api.js service    │   │  │  │    api.js service    │   │
│  │  • getAllStock()     │   │  │  │  • getAllStock()     │   │
│  │  • getStockStats()   │   │  │  │  • getStockStats()   │   │
│  │  • createStockItem() │   │  │  │  (read-only methods) │   │
│  │  • updateStockItem() │   │  │  │                      │   │
│  └──────────────────────┘   │  │  └──────────────────────┘   │
└─────────────────────────────┘  └──────────────────────────────┘
```

## 🔄 Request Flow Example

### Viewing Stock Items

```
1. User opens Stock Management page
   ↓
2. React useEffect() triggers on mount
   ↓
3. api.getAllStock() called
   ↓
4. Fetch request to http://localhost:3000/api/stock
   ↓
5. Express router → stock.controller.getAllStockItems()
   ↓
6. Supabase query: SELECT * FROM stock_items
   ↓
7. Supabase returns data
   ↓
8. Backend sends JSON response
   ↓
9. Frontend updates state with data
   ↓
10. React re-renders table with real data
```

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│  Frontend (React)                   │
│  • Environment variables            │
│  • API URL configuration            │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Backend (Express)                  │
│  • CORS validation                  │
│  • Request validation               │
│  • Error handling                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Supabase                           │
│  • Row Level Security (RLS)         │
│  • Authentication required          │
│  • API key validation               │
└─────────────────────────────────────┘
```

## 📦 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS v4 | Styling |
| UI Components | Radix UI + shadcn/ui | Component library |
| Routing | React Router v7 | Navigation |
| Backend | Node.js + Express | API server |
| Database | Supabase (PostgreSQL) | Data storage |
| Hosting | Render | Deployment platform |

## 🌐 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION (Render)                       │
│                                                              │
│  ┌────────────────────┐                                     │
│  │  Backend API       │                                     │
│  │  (Web Service)     │                                     │
│  │  Port: 3000        │                                     │
│  └─────────┬──────────┘                                     │
│            │                                                 │
│            ├──────────────┬──────────────────┐              │
│            ↓              ↓                  ↓              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Admin     │  │     HR      │  │  Supabase   │        │
│  │  Dashboard  │  │  Dashboard  │  │  Database   │        │
│  │ (Static)    │  │  (Static)   │  │  (Cloud)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

## 📊 Data Model

### stock_items
```sql
id                UUID PRIMARY KEY
category          VARCHAR(50)      -- Kitchen Essentials, etc.
item_name         VARCHAR(100)     -- Sugar, Milk, etc.
current_quantity  DECIMAL(10,2)    -- 8, 9, 1, etc.
unit              VARCHAR(20)      -- kg, boxes, tins, etc.
threshold         DECIMAL(10,2)    -- Alert level
is_durable        BOOLEAN          -- TRUE for Kitchen Stock
notes             TEXT             -- Supplier, brand, etc.
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### purchase_history
```sql
id              UUID PRIMARY KEY
stock_item_id   UUID FOREIGN KEY
quantity        DECIMAL(10,2)
unit_price      DECIMAL(10,2)
purchase_date   DATE
notes           TEXT
created_by      VARCHAR(100)
created_at      TIMESTAMP
```

### water_deliveries
```sql
id                 UUID PRIMARY KEY
delivery_date      DATE
bottles_delivered  INTEGER
notes              TEXT
created_at         TIMESTAMP
```

## 🎯 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Backend API | ✅ Complete | 8 endpoints working |
| Database Schema | ✅ Complete | 3 tables with RLS |
| Seed Data | ✅ Complete | 47 items from Excel |
| Admin Frontend | ✅ Complete | Connected to API |
| HR Frontend | ✅ Complete | Read-only access |
| Mock Data Removed | ✅ Complete | Both dashboards |
| Error Handling | ✅ Complete | With retry logic |
| Loading States | ✅ Complete | Spinner animations |
| Search/Filter | ✅ Complete | Real-time filtering |
| Low Stock Alerts | ✅ Complete | Dynamic calculation |

## 🔜 Future Enhancements

### Phase 2 (Next)
- [ ] Add Item dialog with form validation
- [ ] Edit Item modal
- [ ] Delete confirmation dialog
- [ ] Purchase history modal
- [ ] Export to Excel functionality
- [ ] Bulk import from Excel

### Phase 3
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Stock movement tracking
- [ ] Automated reorder suggestions
- [ ] Email alerts for low stock
- [ ] Barcode scanning
- [ ] Mobile app

## 📝 Notes

- All 47 items from your Excel file are now in the database
- Low stock alerts are calculated dynamically (current_quantity <= threshold)
- HR dashboard intentionally has no write access
- Purchase history automatically updates stock quantities
- Water deliveries tracked separately for better analytics
