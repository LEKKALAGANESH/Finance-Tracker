# Finance Tracker - API Reference

Complete API documentation for the Finance Tracker backend.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except `/health`) require a valid JWT token.

```
Authorization: Bearer <your-jwt-token>
```

The token is obtained from Supabase Auth after login.

---

## Expenses

### List Expenses

```http
GET /expenses
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |
| start_date | string | Filter from date (YYYY-MM-DD) |
| end_date | string | Filter to date (YYYY-MM-DD) |
| category_id | string | Filter by category UUID |
| min_amount | number | Minimum amount filter |
| max_amount | number | Maximum amount filter |
| search | string | Search in description |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "amount": 45.99,
      "description": "Grocery shopping",
      "date": "2024-01-15",
      "payment_method": "credit_card",
      "receipt_url": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "category": {
        "id": "uuid",
        "name": "Groceries",
        "icon": "🛒",
        "color": "#84cc16"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

### Create Expense

```http
POST /expenses
```

**Request Body:**

```json
{
  "category_id": "uuid",
  "amount": 45.99,
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "payment_method": "credit_card"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "amount": 45.99,
    "description": "Grocery shopping",
    "date": "2024-01-15",
    "payment_method": "credit_card",
    "receipt_url": null,
    "created_at": "2024-01-15T10:30:00Z",
    "category": {
      "id": "uuid",
      "name": "Groceries",
      "icon": "🛒",
      "color": "#84cc16"
    }
  }
}
```

### Get Expense

```http
GET /expenses/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "amount": 45.99,
    "description": "Grocery shopping",
    "date": "2024-01-15",
    "payment_method": "credit_card",
    "receipt_url": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "category": {
      "id": "uuid",
      "name": "Groceries",
      "icon": "🛒",
      "color": "#84cc16"
    }
  }
}
```

### Update Expense

```http
PUT /expenses/{id}
```

**Request Body:** (all fields optional)

```json
{
  "category_id": "uuid",
  "amount": 50.00,
  "description": "Updated description",
  "date": "2024-01-16",
  "payment_method": "debit_card"
}
```

**Response:** `200 OK`

### Delete Expense

```http
DELETE /expenses/{id}
```

**Response:** `204 No Content`

---

## Budgets

### List Budgets

```http
GET /budgets
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "amount": 500.00,
      "period": "monthly",
      "start_date": "2024-01-01",
      "alert_threshold": 80,
      "created_at": "2024-01-01T00:00:00Z",
      "category": {
        "id": "uuid",
        "name": "Food & Dining",
        "icon": "🍔",
        "color": "#f97316"
      }
    }
  ]
}
```

### Get Budget Status

```http
GET /budgets/status
```

Returns budgets with calculated spending information.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "amount": 500.00,
      "period": "monthly",
      "alert_threshold": 80,
      "spent": 425.50,
      "remaining": 74.50,
      "percentage": 85.1,
      "is_over": false,
      "is_near_limit": true,
      "category": {
        "name": "Food & Dining",
        "icon": "🍔",
        "color": "#f97316"
      }
    }
  ]
}
```

### Create Budget

```http
POST /budgets
```

**Request Body:**

```json
{
  "category_id": "uuid",  // optional, null for overall budget
  "amount": 500.00,
  "period": "monthly",    // "weekly" | "monthly" | "yearly"
  "alert_threshold": 80   // 1-100, default 80
}
```

### Update Budget

```http
PUT /budgets/{id}
```

### Delete Budget

```http
DELETE /budgets/{id}
```

---

## Goals

### List Goals

```http
GET /goals
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Emergency Fund",
      "target_amount": 10000.00,
      "current_amount": 2500.00,
      "deadline": "2024-12-31",
      "icon": "🎯",
      "color": "#6366f1",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Goal

```http
POST /goals
```

**Request Body:**

```json
{
  "name": "Emergency Fund",
  "target_amount": 10000.00,
  "deadline": "2024-12-31",
  "icon": "🎯",
  "color": "#6366f1"
}
```

### Update Goal

```http
PUT /goals/{id}
```

### Delete Goal

```http
DELETE /goals/{id}
```

### Add Contribution

```http
POST /goals/{id}/contribute
```

**Request Body:**

```json
{
  "amount": 500.00
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Emergency Fund",
    "target_amount": 10000.00,
    "current_amount": 3000.00,
    "status": "active",
    "message": "Contribution added successfully"
  }
}
```

If the contribution completes the goal:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Emergency Fund",
    "target_amount": 10000.00,
    "current_amount": 10000.00,
    "status": "completed",
    "message": "Congratulations! Goal completed!"
  }
}
```

---

## Categories

### List Categories

```http
GET /categories
```

Returns user's custom categories plus default categories.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type: "expense" or "income" |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": null,
      "name": "Food & Dining",
      "icon": "🍔",
      "color": "#f97316",
      "type": "expense",
      "is_default": true
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Custom Category",
      "icon": "⭐",
      "color": "#8b5cf6",
      "type": "expense",
      "is_default": false
    }
  ]
}
```

### Create Category

```http
POST /categories
```

**Request Body:**

```json
{
  "name": "My Custom Category",
  "icon": "⭐",
  "color": "#8b5cf6",
  "type": "expense"
}
```

### Update Category

```http
PUT /categories/{id}
```

Note: Cannot update default categories.

### Delete Category

```http
DELETE /categories/{id}
```

Note: Cannot delete default categories or categories with existing expenses.

---

## AI Insights

### Get Spending Summary

```http
GET /insights/summary
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | "week", "month", "year" (default: "month") |

**Response:**

```json
{
  "success": true,
  "data": {
    "total_spent": 1250.50,
    "transaction_count": 42,
    "average_transaction": 29.77,
    "top_categories": [
      {
        "name": "Food & Dining",
        "amount": 450.00,
        "percentage": 36.0,
        "icon": "🍔",
        "color": "#f97316"
      }
    ],
    "comparison": {
      "previous_period": 1100.00,
      "change_amount": 150.50,
      "change_percentage": 13.7,
      "trend": "up"
    }
  }
}
```

### Get AI Tips

```http
GET /insights/tips
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "tip",
      "title": "Reduce dining out",
      "content": "Your food spending is 40% of your budget. Consider meal prepping to save money.",
      "priority": "high",
      "icon": "💡"
    },
    {
      "id": "uuid",
      "type": "warning",
      "title": "Budget alert",
      "content": "You've used 85% of your monthly budget with 10 days remaining.",
      "priority": "medium",
      "icon": "⚠️"
    }
  ]
}
```

### Chat with AI

```http
POST /insights/chat
```

**Request Body:**

```json
{
  "message": "How can I save more money on groceries?"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "Based on your spending patterns, here are some suggestions for saving on groceries:\n\n1. Make a shopping list and stick to it\n2. Buy in bulk for non-perishables\n3. Use coupons and store loyalty programs\n4. Plan your meals for the week\n5. Compare prices across different stores\n\nYour current grocery spending is $320/month. These strategies could help you save 15-20%."
  }
}
```

### Get Predictions

```http
GET /insights/predictions
```

**Response:**

```json
{
  "success": true,
  "data": {
    "next_month": {
      "predicted_total": 1350.00,
      "confidence": 0.85,
      "by_category": [
        {
          "name": "Food & Dining",
          "predicted": 480.00,
          "trend": "stable"
        }
      ]
    },
    "savings_potential": 200.00,
    "recommendations": [
      "Reducing entertainment spending could save $100/month"
    ]
  }
}
```

---

## Reports

### Monthly Report

```http
GET /reports/monthly
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| year | integer | Year (default: current year) |

**Response:**

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "months": [
      {
        "month": 1,
        "name": "January",
        "total": 1250.50,
        "transaction_count": 42,
        "top_category": "Food & Dining"
      }
    ],
    "yearly_total": 1250.50,
    "monthly_average": 1250.50
  }
}
```

### Category Report

```http
GET /reports/category
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| start_date | string | Start date (YYYY-MM-DD) |
| end_date | string | End date (YYYY-MM-DD) |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "total": 1250.50,
    "categories": [
      {
        "id": "uuid",
        "name": "Food & Dining",
        "icon": "🍔",
        "color": "#f97316",
        "total": 450.00,
        "percentage": 36.0,
        "transaction_count": 15,
        "average_transaction": 30.00
      }
    ]
  }
}
```

### Export

```http
GET /reports/export
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | "csv" or "pdf" |
| start_date | string | Start date (YYYY-MM-DD) |
| end_date | string | End date (YYYY-MM-DD) |

**Response:** File download

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input data",
    "details": {
      "amount": "Amount must be greater than 0"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- 100 requests per minute for standard endpoints
- 10 requests per minute for AI endpoints

---

## Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Date Formats

- All dates use ISO 8601 format
- Date only: `YYYY-MM-DD` (e.g., `2024-01-15`)
- DateTime: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `2024-01-15T10:30:00Z`)
