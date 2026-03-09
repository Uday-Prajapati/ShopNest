## ShopNest Microservices – Project Notes

This document summarizes the overall architecture, roles, and key REST endpoints for the ShopNest e‑commerce microservice system.

---

### Overall Architecture

- **Gateway**: `api-gateway`
  - Technology: Spring Cloud Gateway, JWT validation, Eureka client.
  - All frontend calls go to `/api/**` and are routed to services via gateway.
  - Validates JWT, then adds:
    - `X-Auth-Username`: authenticated username.
    - `X-User-Roles`: comma-separated list of authorities (e.g. `ROLE_CUSTOMER,ROLE_MERCHANT`).

- **Auth Service**: `auth-service`
  - Registers and authenticates users.
  - Issues JWT tokens with `username` and `authorities` claims.
  - Roles enum: `ROLE_CUSTOMER`, `ROLE_MERCHANT`, `ROLE_DELIVERY_AGENT`, `ROLE_ADMIN`.

- **Profile Service**: `profile-service`
  - Stores extended user profile + addresses + single `role` string.
  - Secured via headers from gateway and explicit checks in `ProfileController`.

- **Product Service**: `product-service`
  - Catalog, search, filtering, reviews, stock/price updates.
  - MongoDB storage.
  - Merchant and admin role protection for write operations.

- **Cart Service**: `cart-service`
  - Manages per-user cart, items, quantities, totals, checkout.
  - Trusts `X-Auth-Username` and requires it to match the `userId` path parameter.

- **Order Service**: `order-service`
  - Creates orders from cart, coordinates product stock and wallet payments.
  - Exposes user order history, totals, and status changes.
  - Shared endpoints for merchant/admin/delivery to view and update statuses.

- **Wallet Service**: `wallet-service`
  - Per-user wallet, balance, add‑money, payments, refunds, transaction history, stats.
  - Only the owner (or internal calls) can operate a wallet.

- **Service Registry**: `service-registry`
  - Eureka server for service discovery.

- **Frontend**: `frontend` (React + Vite + Tailwind)
  - Single SPA with role‑aware navigation and dashboards for:
    - Customer
    - Merchant
    - Delivery Agent
    - Admin

---

### Role Flows – Coverage

#### CUSTOMER

- **Register / Login**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - Frontend: `Register` + `Login` pages (role selectable: customer/merchant).

- **Complete Profile / Add Address**
  - `POST /api/profiles` – create profile after registration.
  - `PUT /api/profiles/{id}` – update profile.
  - `POST /api/profiles/{profileId}/addresses` – add address (owner or admin only).
  - `PUT /api/profiles/{profileId}/addresses/{addressId}` – update address.
  - `DELETE /api/profiles/{profileId}/addresses/{addressId}` – delete address.

- **Browse/Search/View Products**
  - `GET /api/products` – list all.
  - `GET /api/products/paginated` – paginated.
  - `GET /api/products/{id}` – product detail.
  - `GET /api/products/search?q=...` – search.
  - `GET /api/products/category/{category}` – category filter.
  - `GET /api/products/brand/{brand}` – brand filter.
  - `GET /api/products/filter/price?min=&max=` – price range.
  - `GET /api/products/filter/rating?min=` – rating filter.

- **Cart**
  - `GET /api/carts/user/{userId}` – get active cart (only if `userId == X-Auth-Username`).
  - `POST /api/carts/user/{userId}/items` – add item to cart.
  - `PUT /api/carts/user/{userId}/items/{itemId}` – change quantity.
  - `DELETE /api/carts/user/{userId}/items/{itemId}` – remove item.
  - `DELETE /api/carts/user/{userId}/clear` – clear cart.
  - `GET /api/carts/user/{userId}/total` – cart total.

- **Wallet (Create / Add Money / Pay by Wallet)**
  - `POST /api/wallets/user/{userId}` – create wallet (only owner).
  - `GET /api/wallets/user/{userId}/balance` – current balance.
  - `GET /api/wallets/user/{userId}/transactions` – transaction history.
  - `GET /api/wallets/user/{userId}/stats` – `{ totalCredits, totalDebits }`.
  - `POST /api/wallets/add-money` – add money:
    - Body: `{ "userId", "amount", "paymentMethod" }`.
  - Internal (order‑service → wallet‑service):
    - `POST /api/wallets/pay` – deduct for wallet payments.
    - `POST /api/wallets/refund` – refund for cancellations/returns.

- **Orders / History / Cancel / Reorder / Track Delivery**
  - `POST /api/orders` – create order from active cart.
    - Wallet payment: `paymentMethod = "WALLET"`.
    - COD payment: `paymentMethod = "COD"`.
  - `GET /api/orders/user/{userId}` – list user orders.
  - `GET /api/orders/user/{userId}/history` – delivered + cancelled orders.
  - `GET /api/orders/user/{userId}/total-spent` – total spent on delivered orders.
  - `GET /api/orders/user/{userId}/count` – number of orders.
  - `GET /api/orders/{id}` / `/number/{orderNumber}` – detail.
  - `POST /api/orders/{id}/cancel?reason=` – cancel (only owner or admin).
  - Reorder: frontend reuses order detail + cart APIs to add items and create a new order.
  - Track delivery:
    - Uses overall order status progression `PENDING → CONFIRMED → SHIPPED → DELIVERED` from `/api/orders/{id}`.

- **Reviews**
  - `GET /api/products/{id}/reviews` – list reviews.
  - `POST /api/products/{id}/reviews` – add review (any logged‑in user; typically customer).

All customer actions are restricted to their own `userId` (derived from `X-Auth-Username`), so they cannot see or manipulate other users’ data.

#### MERCHANT

- **Register / Login / Profile**
  - Same endpoints as customer, but selected role `ROLE_MERCHANT` at registration.
  - Profile stored with `role = "ROLE_MERCHANT"` in profile-service.

- **Product Management**
  - All protected with `hasRole("MERCHANT")` or `hasAnyRole("MERCHANT","ADMIN")` in product-service:
    - `POST /api/products` – add new product (name, description, price, images, category, brand, stock, etc.).
    - `PUT /api/products/{id}` – update product (including price).
    - `PATCH /api/products/{id}` – partial updates (pricing, flags, etc.).
  - Stock updates:
    - Internal: `PUT /api/products/{id}/stock` – used by order-service when orders are placed.

- **View Pending Orders / Confirm / Process / SHIPPED**
  - `GET /api/orders/status/PENDING` – list pending orders (merchant/delivery/admin only).
  - `PATCH /api/orders/{id}/status?status=CONFIRMED` – confirm order.
  - `PATCH /api/orders/{id}/status?status=PROCESSING` – mark as processing.
  - `PATCH /api/orders/{id}/status?status=SHIPPED` – mark as shipped (handover to delivery).
  - All these are allowed only if role is `ROLE_MERCHANT`, `ROLE_DELIVERY_AGENT`, or `ROLE_ADMIN`.

- **Sales Report / Inventory / Collections**
  - Inventory and catalog:
    - `GET /api/products` (+ filters) for viewing current products.
  - Sales reporting:
    - Merchant can inspect orders by status (e.g. `DELIVERED`) using `/api/orders/status/{status}` and compute totals on the frontend.
  - Collections:
    - Represented as category/brand flags; new collections are created by adding products with new categories/brands through the standard product APIs.

#### DELIVERY AGENT

- **Register / Login**
  - Same auth endpoints; account created with role `ROLE_DELIVERY_AGENT` (currently via backend or seeding; UI can be extended similarly to merchant).

- **View Assigned Deliveries**
  - Assigned = all orders with `status = SHIPPED`:
    - `GET /api/orders/status/SHIPPED` – delivery/merchant/admin only.

- **Pickup / Out For Delivery / Delivered**
  - Pickup address is included in order’s shipping/billing info and product details, shown in frontend (delivery dashboard uses order fields like `shippingAddress`).
  - Status transitions:
    - `PATCH /api/orders/{id}/status?status=OUT_FOR_DELIVERY` – mark as out for delivery.
    - `PATCH /api/orders/{id}/status?status=DELIVERED` – mark delivered.
  - COD collection:
    - COD orders have `paymentMethod = "COD"`; when marked delivered, financial reconciliation can be computed via delivered orders totals.

- **Daily Earnings**
  - `GET /api/orders/delivery/earnings/today` – delivery/admin only.
    - Computes 5% of the sum of all delivered orders for the current day as a simple earnings metric.

#### ADMIN

- **List All Profiles**
  - `GET /api/profiles` – requires `ROLE_ADMIN`.
  - `GET /api/profiles/role/{role}` – filter by role (admin only).
  - `GET /api/profiles/search?q=` – search profiles (admin only).

- **Delete Profile**
  - `DELETE /api/profiles/{id}` – requires `ROLE_ADMIN`.

Admins can also use merchant/delivery status endpoints because they have `ROLE_ADMIN` and pass the role checks in order-service and product-service.

---

### Security & Ownership Rules (Important)

- Gateway validates JWT and attaches `X-Auth-Username` and `X-User-Roles` headers.
- **Cart, Order, Wallet, Profile services** enforce ownership:
  - For endpoints with `/user/{userId}` or `/profiles/{id}`:
    - Compare `userId`/profile owner with `X-Auth-Username`.
    - Allow if equal, or if `X-User-Roles` contains `ROLE_ADMIN` (for admin‑only operations).
- **Product service**:
  - Read endpoints are public.
  - Write endpoints require:
    - Merchant: create/update products and pricing.
    - Admin: delete products and perform privileged updates.
- **Order service**:
  - User‑specific listing/history/total/count require `userId == X-Auth-Username`.
  - Status updates and list‑by‑status require merchant, delivery agent, or admin role.
  - Cancel and process payment require order owner or admin.
- **Wallet service**:
  - All `/user/{userId}/...` endpoints require `userId == X-Auth-Username`.
  - Internal payment/refund endpoints are used by order-service only.

---

### Running the Project

1. Start **service-registry** (Eureka).
2. Start **auth-service**, **profile-service**, **product-service**, **cart-service**, **wallet-service**, and **order-service** (ensure their databases are running and configured).
3. Start **api-gateway** (configured to talk to Eureka and route `/api/**`).
4. Start **frontend** (Vite dev server):
   - `cd frontend`
   - `npm install` (first time)
   - `npm run dev`
5. Open the frontend in the browser and use the flows described above for each role.

All key paths and ownership checks are implemented so the main customer, merchant, delivery, and admin flows work without cross‑user data leaks or backend errors, assuming all microservices and databases are correctly configured and running.

