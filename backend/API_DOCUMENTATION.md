# 📡 Stock Management API Documentation

Base URL: `http://localhost:3000/api` (development)

## 📊 Stock Endpoints

### Get All Stock Items
```http
GET /stock
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category": "Kitchen Essentials",
      "item_name": "Sugar",
      "current_quantity": 8,
      "unit": "kg",
      "threshold": 8,
      "is_durable": false,
      "notes": "",
      "created_at": "2026-03-12T10:00:00Z",
      "updated_at": "2026-03-12T10:00:00Z"
    }
  ]
}
```

---

### Get Stock Statistics
```http
GET /stock/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_items": 47,
    "low_stock_count": 12,
    "categories_count": 5,
    "categories": [
      "Kitchen Essentials",
      "Washroom Essentials",
      "Snacks",
      "Water Count",
      "Kitchen Stock"
    ]
  }
}
```

---

### Get Low Stock Items
```http
GET /stock/low-stock
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "uuid",
      "item_name": "Tea Spoons",
      "current_quantity": 4,
      "threshold": 5,
      "unit": "pcs"
    }
  ]
}
```

---

### Get Stock by Category
```http
GET /stock/category/:category
```

**Parameters:**
- `category` (string): Kitchen Essentials, Washroom Essentials, Snacks, Water Count, Kitchen Stock

**Example:**
```http
GET /stock/category/Kitchen%20Essentials
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category": "Kitchen Essentials",
      "item_name": "Sugar",
      "current_quantity": 8,
      "unit": "kg"
    }
  ]
}
```

---

### Get Single Stock Item
```http
GET /stock/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "Kitchen Essentials",
    "item_name": "Sugar",
    "current_quantity": 8,
    "unit": "kg",
    "threshold": 8,
    "purchase_history": [
      {
        "id": "uuid",
        "quantity": 10,
        "unit_price": 150,
        "purchase_date": "2026-02-26",
        "notes": "Bulk purchase"
      }
    ]
  }
}
```

---

### Create Stock Item
```http
POST /stock
```

**Request Body:**
```json
{
  "category": "Kitchen Essentials",
  "item_name": "Green Tea",
  "current_quantity": 5,
  "unit": "boxes",
  "threshold": 8,
  "is_durable": false,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "Kitchen Essentials",
    "item_name": "Green Tea",
    "current_quantity": 5,
    "unit": "boxes",
    "threshold": 8
  }
}
```

---

### Update Stock Item
```http
PUT /stock/:id
```

**Request Body:**
```json
{
  "current_quantity": 15,
  "threshold": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "current_quantity": 15,
    "threshold": 10
  }
}
```

---

### Delete Stock Item
```http
DELETE /stock/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Stock item deleted successfully"
}
```

---

### Add Purchase History
```http
POST /stock/:id/purchase
```

**Request Body:**
```json
{
  "quantity": 10,
  "unit_price": 150,
  "purchase_date": "2026-03-12",
  "notes": "Bulk purchase from supplier"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "stock_item_id": "uuid",
    "quantity": 10,
    "unit_price": 150,
    "purchase_date": "2026-03-12"
  }
}
```

**Note:** This automatically updates the `current_quantity` by adding the purchased quantity.

---

## 🔒 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing with cURL

```bash
# Get all stock
curl http://localhost:3000/api/stock

# Get stats
curl http://localhost:3000/api/stock/stats

# Get low stock
curl http://localhost:3000/api/stock/low-stock

# Create item
curl -X POST http://localhost:3000/api/stock \
  -H "Content-Type: application/json" \
  -d '{"category":"Snacks","item_name":"Cookies","current_quantity":10,"unit":"pkts","threshold":8}'

# Add purchase
curl -X POST http://localhost:3000/api/stock/{item-id}/purchase \
  -H "Content-Type: application/json" \
  -d '{"quantity":5,"unit_price":200,"purchase_date":"2026-03-12"}'
```

---

## 📝 Categories Reference

Valid category values:
- `Kitchen Essentials`
- `Washroom Essentials`
- `Snacks`
- `Water Count`
- `Kitchen Stock`
- `Other Purchases`

## 📏 Common Units

- `kg` - Kilograms
- `boxes` - Boxes
- `tins` - Tins
- `pkts` - Packets
- `litres` - Litres
- `bottles` - Bottles
- `pcs` - Pieces
- `pairs` - Pairs
- `bars` - Bars
- `rolls` - Rolls
