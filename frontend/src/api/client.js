/**
 * API client for ShopNest microservices.
 * All calls go through API Gateway at /api (proxied to localhost:8080).
 */
const API_BASE = '';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }
  return data;
}

async function handleResponseNumber(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return text ? Number(text) : 0;
}

export const api = {
  // Auth
  login: (username, password) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(handleResponse),

  register: (body) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/api/auth/me`, { headers: getAuthHeaders() }).then(handleResponse),

  // Products
  getProducts: () =>
    fetch(`${API_BASE}/api/products`, { headers: getAuthHeaders() }).then(handleResponse),

  getProductsPaginated: (page = 0, size = 12, sortBy = 'createdAt', direction = 'desc') =>
    fetch(`${API_BASE}/api/products/paginated?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getProduct: (id) =>
    fetch(`${API_BASE}/api/products/${id}`, { headers: getAuthHeaders() }).then(handleResponse),

  getFeatured: () =>
    fetch(`${API_BASE}/api/products/featured`, { headers: getAuthHeaders() }).then(handleResponse),

  getByCategory: (category) =>
    fetch(`${API_BASE}/api/products/category/${encodeURIComponent(category)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getByBrand: (brand) =>
    fetch(`${API_BASE}/api/products/brand/${encodeURIComponent(brand)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  search: (q) =>
    fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  filterByPrice: (min, max) =>
    fetch(`${API_BASE}/api/products/filter/price?min=${min}&max=${max}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  filterByRating: (min) =>
    fetch(`${API_BASE}/api/products/filter/rating?min=${min}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getProductReviews: (id, page = 0, size = 10) =>
    fetch(`${API_BASE}/api/products/${id}/reviews?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  addReview: (id, review) =>
    fetch(`${API_BASE}/api/products/${id}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(review),
    }).then(handleResponse),

  checkAvailability: (id, quantity = 1) =>
    fetch(`${API_BASE}/api/products/${id}/availability?quantity=${quantity}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Cart
  getCart: (userId) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  addToCart: (userId, productId, quantity = 1) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    }).then(handleResponse),

  updateCartItem: (userId, itemId, quantity) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    }).then(handleResponse),

  removeCartItem: (userId, itemId) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  clearCart: (userId) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getCartTotal: (userId) =>
    fetch(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/total`, {
      headers: getAuthHeaders(),
    }).then(handleResponseNumber),

  // Profile
  getAllProfiles: () =>
    fetch(`${API_BASE}/api/profiles`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getProfileByUsername: (username) =>
    fetch(`${API_BASE}/api/profiles/username/${encodeURIComponent(username)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateProfile: (profileId, updates) =>
    fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }).then(handleResponse),

  createProfile: (body) =>
    fetch(`${API_BASE}/api/profiles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  addAddress: (profileId, address) =>
    fetch(`${API_BASE}/api/profiles/${profileId}/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    }).then(handleResponse),

  updateAddress: (profileId, addressId, address) =>
    fetch(`${API_BASE}/api/profiles/${profileId}/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    }).then(handleResponse),

  deleteAddress: (profileId, addressId) =>
    fetch(`${API_BASE}/api/profiles/${profileId}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  setDefaultAddress: (profileId, addressId) =>
    fetch(`${API_BASE}/api/profiles/${profileId}/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Wallet
  getWallet: (userId) =>
    fetch(`${API_BASE}/api/wallets/user/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  getWalletBalance: (userId) =>
    fetch(`${API_BASE}/api/wallets/user/${encodeURIComponent(userId)}/balance`, {
      headers: getAuthHeaders(),
    }).then(handleResponseNumber),

  createWallet: (userId) =>
    fetch(`${API_BASE}/api/wallets/user/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  addMoneyToWallet: (userId, amount, paymentMethod) =>
    fetch(`${API_BASE}/api/wallets/add-money`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, amount, paymentMethod }),
    }).then(handleResponse),

  getWalletTransactions: (userId, page = 0, size = 10) =>
    fetch(`${API_BASE}/api/wallets/user/${encodeURIComponent(userId)}/transactions?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getWalletStats: (userId) =>
    fetch(`${API_BASE}/api/wallets/user/${encodeURIComponent(userId)}/stats`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Orders
  createOrder: (orderRequest) =>
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderRequest),
    }).then(handleResponse),

  getOrder: (id) =>
    fetch(`${API_BASE}/api/orders/${id}`, { headers: getAuthHeaders() }).then(handleResponse),

  getOrderByNumber: (orderNumber) =>
    fetch(`${API_BASE}/api/orders/number/${encodeURIComponent(orderNumber)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getOrdersByUser: (userId) =>
    fetch(`${API_BASE}/api/orders/user/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getOrdersByStatus: (status) =>
    fetch(`${API_BASE}/api/orders/status/${encodeURIComponent(status)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Admin
  deleteProfile: (profileId) =>
    fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  cancelOrder: (id, reason) =>
    fetch(`${API_BASE}/api/orders/${id}/cancel?reason=${encodeURIComponent(reason || '')}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  requestReturn: (returnRequest) =>
    fetch(`${API_BASE}/api/orders/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(returnRequest),
    }).then(handleResponse),

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/api/orders/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getTodayDeliveryEarnings: () =>
    fetch(`${API_BASE}/api/orders/delivery/earnings/today`, {
      headers: getAuthHeaders(),
    }).then(handleResponseNumber),
};
