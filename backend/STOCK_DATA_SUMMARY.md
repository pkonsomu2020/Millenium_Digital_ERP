# Stock Management Data Summary

Data extracted from: `Updated Kitchen_and_Washroom_Essentials (1) (1).xlsx`

## 📊 Total Inventory: 47 Items

### 🍵 Kitchen Essentials (8 Consumable Items)
1. Sugar - 8 kg
2. Milk - 9 boxes
3. Drinking Chocolate - 1 tin
4. Coffee - 1 tin
5. Tea leaves - 2 bags
6. Matchbox - 1 pkt
7. Super Brite - 2 pcs
8. Batteries - 2 pairs

### 🧼 Washroom Essentials (15 Consumable Items)
1. Tissue - 5 pkts
2. Serviettes - 8 pkts
3. Hand Towels - 6 pkts
4. Toilet Balls - 2 pkts
5. Liquid Washing Soap - 5 litres
6. Gloves - 2 pairs
7. Mop - 1 pcs
8. Hand Wash - 6 bottles
9. Washroom Soap - 3 bars
10. Glass Cleaner - 2 bottles
11. Jik (White) - 1 bottle
12. Jik (Coloured) - 1 bottle
13. Furniture Polish - 1 bottle
14. Washing Powder - 2 pkts
15. Sufuria - 1 pcs

### 🍪 Snacks (4 Consumable Items)
1. Biscuits - 2 tins
2. Peanuts - 2 pkts
3. Honey - 2 tins
4. Hibiscus - 2 pkts

### 💧 Water Count (1 Item)
1. Dispenser Bottles - 7 bottles
   - Recent deliveries tracked separately in `water_deliveries` table
   - Average: 6.7 bottles per delivery
   - Latest delivery: March 10, 2026 (7 bottles)

### 🍽️ Kitchen Stock - Durable Items (20 Items)
1. Plates - 6 pcs (SIGNVRSE)
2. Side Plates - 8 pcs (AFOSI)
3. Spoons - 13 pcs (AFOSI)
4. Tea Spoons - 4 pcs (MILLENIUM)
5. Forks - 5 pcs (AFOSI)
6. Glasses - 22 pcs (MILLENIUM)
7. Cups - 18 pcs (MILLENIUM)
8. Thermos - 10 pcs
9. Glass Jugs - 5 pcs
10. Plastic Jugs - 3 pcs
11. Serving Trays - 6 pcs
12. Tumblers - 13 pcs
13. Sufurias (Pots) - 3 pcs
14. Buckets - 5 pcs
15. Dustbins - 16 pcs
16. Salt Shakers - 3 pcs
17. Kitchen Towels - 6 pkts
18. Pegs - 10 pcs
19. Cloth Line - 1 pcs
20. Scrubbing Brush - 1 pcs

## 🔄 Data Flow

```
Excel File → Python Analysis → Database Schema → Supabase → Backend API → Frontend
```

## 🎨 Features Implemented

### Admin Dashboard (Full Access)
- ✅ View all stock items
- ✅ Real-time low stock alerts
- ✅ Search and filter
- ✅ Category statistics
- 🔜 Add new items
- 🔜 Update quantities
- 🔜 Track purchase history

### HR Dashboard (Read-Only)
- ✅ View all stock items
- ✅ Monitor low stock alerts
- ✅ Search and filter
- ❌ Cannot add/edit items (by design)

## 📈 Low Stock Alerts

Items currently below threshold:
- Tea Spoons (4 < 5)
- Forks (5 < 10)
- Multiple consumables need restocking

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can read all data
- Only authenticated users can write data
- HR dashboard has read-only API access
