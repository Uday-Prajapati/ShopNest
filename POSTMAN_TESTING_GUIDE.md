# ShopNest – Complete Postman Testing Guide (Backend)

This document is a **start-to-finish** Postman guide to confirm that **all ShopNest services work correctly** through the **API Gateway**.

## Base URL (API Gateway)

- **Base URL**: `http://localhost:8080`

All endpoints below use **full URLs** (no `{{BASE_URL}}`).

---

## Before you start (one-time setup)

### A) Make sure all services are running

Run these **health checks** in a browser/Postman to confirm everything is up:

- Auth: `GET http://localhost:8080/api/auth/health`
- Profile: `GET http://localhost:8080/api/profiles/health`
- Product: `GET http://localhost:8080/api/products/health`
- Cart: `GET http://localhost:8080/api/carts/health`
- Order: `GET http://localhost:8080/api/orders/health`
- Wallet: `GET http://localhost:8080/api/wallets/health`

Expected: **200 OK** for each.

### B) Create Postman Environment variables (recommended)

Create a Postman environment (example name: `ShopNest-local`) and add these variables:

- `CUSTOMER_TOKEN` (empty initially)
- `MERCHANT_TOKEN` (empty initially)
- `PRODUCT1_ID` (empty initially)
- `PRODUCT2_ID` (empty initially)
- `CART_ITEM1_ID` (empty initially)
- `ORDER_ID` (empty initially)
- `ORDER_NUMBER` (empty initially)
- `COD_ORDER_ID` (empty initially)

---

## Phase 1 — Auth Service (Register + Login)

### 1.1 Register CUSTOMER

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Headers**:
  - `Content-Type: application/json`
- **Body (raw JSON)**:

```json
{
  "username": "john_customer",
  "email": "john@email.com",
  "password": "password123",
  "fullName": "John Customer",
  "mobileNumber": "9876543210",
  "roles": ["ROLE_CUSTOMER"]
}
```

**Expected**
- **201 Created**

---

### 1.2 Register MERCHANT

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{
  "username": "sam_merchant",
  "email": "sam@merchant.com",
  "password": "password123",
  "fullName": "Sam Merchant",
  "mobileNumber": "9876543211",
  "roles": ["ROLE_MERCHANT"]
}
```

**Expected**
- **201 Created**

---

### 1.3 Login as CUSTOMER → save `CUSTOMER_TOKEN`

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{
  "username": "john_customer",
  "password": "password123"
}
```

**Expected**
- **200 OK**
- Response contains:
  - `accessToken`
  - `roles` includes `ROLE_CUSTOMER`

**Postman action**
- Copy `accessToken` and store into env variable `CUSTOMER_TOKEN`.

---

### 1.4 Login as MERCHANT → save `MERCHANT_TOKEN`

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{
  "username": "sam_merchant",
  "password": "password123"
}
```

**Expected**
- **200 OK**
- `roles` includes `ROLE_MERCHANT`

**Postman action**
- Copy `accessToken` and store into env variable `MERCHANT_TOKEN`.

---

## Phase 2 — Profile Service (Create profile + Address)

### 2.1 Create Profile for CUSTOMER

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/profiles`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "username": "john_customer",
  "email": "john@email.com",
  "fullName": "John Customer",
  "mobileNumber": "9876543210",
  "gender": "Male",
  "role": "ROLE_CUSTOMER"
}
```

**Expected**
- **201 Created**
- Response contains profile `id` (save it; in fresh DB it is often `1`).

---

### 2.2 Create Profile for MERCHANT

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/profiles`
- **Headers**:
  - `Authorization: Bearer {{MERCHANT_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "username": "sam_merchant",
  "email": "sam@merchant.com",
  "fullName": "Sam Merchant",
  "mobileNumber": "9876543211",
  "gender": "Male",
  "role": "ROLE_MERCHANT"
}
```

**Expected**
- **201 Created**

---

### 2.3 Get CUSTOMER Profile by username

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/profiles/username/john_customer`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK** with profile JSON

---

### 2.4 Add Address to CUSTOMER Profile

> Use the correct profile id from step **2.1**. If it was `1`, use `1` as shown below.

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/profiles/1/addresses`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "India",
  "addressType": "HOME",
  "isDefault": true
}
```

**Expected**
- **201 Created**
- Profile response contains `addresses[]`

---

## Phase 3 — Product Service (Merchant create + public browse)

### 3.1 Create Product 1 (Merchant)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/products`
- **Headers**:
  - `Authorization: Bearer {{MERCHANT_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productCode": "IPHONE001",
  "name": "iPhone 15 Pro",
  "description": "Latest Apple iPhone with A17 Pro chip",
  "category": "Electronics",
  "categoryId": "cat001",
  "price": 99999,
  "discountedPrice": 94999,
  "stockQuantity": 50,
  "images": [
    "https://example.com/iphone15-1.jpg",
    "https://example.com/iphone15-2.jpg"
  ],
  "specifications": {
    "brand": "Apple",
    "model": "iPhone 15 Pro",
    "color": "Natural Titanium",
    "size": "6.1 inches",
    "weight": "187g",
    "material": "Titanium",
    "additionalSpecs": {
      "processor": "A17 Pro",
      "ram": "8GB",
      "storage": "256GB",
      "battery": "3274mAh"
    }
  },
  "brand": "Apple",
  "tags": ["smartphone", "5g", "ios", "premium"],
  "isFeatured": true
}
```

**Expected**
- **201 Created**
- Response contains product `id` (MongoDB string)

**Postman action**
- Save product `id` into env variable `PRODUCT1_ID`.

---

### 3.2 Create Product 2 (Merchant)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/products`
- **Headers**:
  - `Authorization: Bearer {{MERCHANT_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productCode": "SAMSUNG001",
  "name": "Samsung S24 Ultra",
  "description": "Latest Samsung with AI features",
  "category": "Electronics",
  "price": 89999,
  "stockQuantity": 30,
  "brand": "Samsung",
  "tags": ["smartphone", "5g", "android"],
  "isFeatured": true
}
```

**Expected**
- **201 Created**

**Postman action**
- Save product `id` into env variable `PRODUCT2_ID`.

---

### 3.3 Get All Products (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products`

**Expected**
- **200 OK** list includes both products

---

### 3.4 Get Product by ID (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products/{{PRODUCT1_ID}}`

**Expected**
- **200 OK** iPhone product JSON

---

### 3.5 Get Products by Category (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products/category/Electronics`

**Expected**
- **200 OK** list of Electronics

---

### 3.6 Search Products (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products/search?q=iPhone`

**Expected**
- **200 OK** list includes iPhone

---

### 3.7 Featured Products (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products/featured`

**Expected**
- **200 OK** list of featured products

---

### 3.8 Filter by Price Range (Public)

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/products/filter/price?min=50000&max=100000`

**Expected**
- **200 OK** list of products in range

---

## Phase 4 — Cart Service (Customer)

> Cart productId is a **string** (Mongo id). Use `{{PRODUCT1_ID}}` and `{{PRODUCT2_ID}}`.

### 4.1 Add Item 1 to Cart

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/items`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productId": "{{PRODUCT1_ID}}",
  "quantity": 2
}
```

**Expected**
- **201 Created**
- Response contains `items[]`

---

### 4.2 Add Item 2 to Cart

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/items`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productId": "{{PRODUCT2_ID}}",
  "quantity": 1
}
```

**Expected**
- **201 Created**
- Cart now has **2 items**

---

### 4.3 View Cart

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/carts/user/john_customer`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**
- `items.length = 2`

**Postman action**
- Copy first item `id` from `items[0].id` and save into env variable `CART_ITEM1_ID`.

---

### 4.4 Update Quantity (item 1)

- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/items/{{CART_ITEM1_ID}}`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "quantity": 3
}
```

**Expected**
- **200 OK**
- Quantity updated, totals updated

---

### 4.5 Get Cart Total

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/total`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK** numeric total

---

## Phase 5 — Wallet Service (Customer)

### 5.1 Create Wallet

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/wallets/user/john_customer`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **201 Created**

---

### 5.2 Add Money

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/wallets/add-money`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "userId": "john_customer",
  "amount": 500000,
  "paymentMethod": "CARD",
  "description": "Added money for shopping"
}
```

**Expected**
- **200 OK**
- Wallet balance updated

---

### 5.3 Check Balance

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/wallets/user/john_customer/balance`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK** numeric balance (e.g., `500000`)

---

### 5.4 Transactions

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/wallets/user/john_customer/transactions`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**
- Includes at least one CREDIT transaction

---

## Phase 6 — Order Service (Wallet payment end-to-end)

### 6.1 Create Order (WALLET)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/orders`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "userId": "john_customer",
  "paymentMethod": "WALLET",
  "phoneNumber": "9876543210",
  "notes": "Please deliver before 6 PM"
}
```

**Expected**
- **201 Created**
- `status = CONFIRMED`
- `paymentStatus = COMPLETED`
- Response includes:
  - `id`
  - `orderNumber`

**Postman action**
- Save response `id` into `ORDER_ID`
- Save response `orderNumber` into `ORDER_NUMBER`

---

### 6.2 Verify Wallet Balance reduced

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/wallets/user/john_customer/balance`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**
- Balance reduced by order total

---

### 6.3 Get Order by ID

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/orders/{{ORDER_ID}}`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK** full order JSON

---

### 6.4 Get Order by Order Number

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/orders/number/{{ORDER_NUMBER}}`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**

---

### 6.5 Get All Orders for User

- **Method**: `GET`
- **URL**: `http://localhost:8080/api/orders/user/john_customer`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**
- List contains your order(s)

---

## Phase 7 — COD Order + Cancel flow

### 7.1 Clear Cart

- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/clear`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK** cart empty

---

### 7.2 Add 1 item again

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/carts/user/john_customer/items`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productId": "{{PRODUCT1_ID}}",
  "quantity": 1
}
```

**Expected**
- **201 Created**

---

### 7.3 Create COD Order

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/orders`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "userId": "john_customer",
  "paymentMethod": "COD",
  "phoneNumber": "9876543210",
  "notes": "Cash on delivery"
}
```

**Expected**
- **201 Created**
- `paymentStatus = PENDING`
- `status = CONFIRMED`

**Postman action**
- Save response `id` into `COD_ORDER_ID`

---

### 7.4 Update Order Status (Merchant)

- **Method**: `PATCH`
- **URL**: `http://localhost:8080/api/orders/{{COD_ORDER_ID}}/status?status=CONFIRMED`
- **Headers**:
  - `Authorization: Bearer {{MERCHANT_TOKEN}}`

**Expected**
- **200 OK**
- status updated

---

### 7.5 Cancel COD Order (Customer)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/orders/{{COD_ORDER_ID}}/cancel?reason=Changed%20mind`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`

**Expected**
- **200 OK**
- `status = CANCELLED`

---

## Phase 8 — Role-Based Access (must fail)

### 8.1 CUSTOMER tries to create product (must fail)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/products`
- **Headers**:
  - `Authorization: Bearer {{CUSTOMER_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:

```json
{
  "productCode": "TEST001",
  "name": "Test Product",
  "price": 1000,
  "category": "Test",
  "stockQuantity": 1
}
```

**Expected**
- **403 Forbidden**

---

### 8.2 MERCHANT tries to delete product (must fail, ADMIN only)

- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/products/{{PRODUCT1_ID}}`
- **Headers**:
  - `Authorization: Bearer {{MERCHANT_TOKEN}}`

**Expected**
- **403 Forbidden**

---

## Notes / Common Issues

### A) If Cart fails after you changed productId type

If you previously had `cart_items.product_id` as a numeric column in MySQL, you may need to update schema:

- Clear table:
  - `TRUNCATE TABLE cart_items;`
- Alter column:
  - `ALTER TABLE cart_items MODIFY COLUMN product_id VARCHAR(50);`

### B) Always use Mongo product IDs in cart/order flow

Cart requires string product IDs like:

- `"67c4a8f1b3e5a12d4c8f9a3b"`

Not `1` or `2`.

