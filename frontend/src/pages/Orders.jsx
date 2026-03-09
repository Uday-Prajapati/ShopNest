import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AuthGuard from '../components/AuthGuard';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function OrderCard({ order }) {
  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';
  const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-lg shadow border p-4 hover:shadow-md transition"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-medium text-amazon-dark">Order #{order.orderNumber}</p>
          <p className="text-sm text-gray-500">
            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'} · {itemCount} item(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{order.status}</span>
          <span className="font-bold text-amazon-orange">₹{(order.totalAmount || 0).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!user?.username) return;
    api.getOrdersByUser(user.username).then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user?.username]);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term (order number)
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amazon-dark mb-6">Your Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Order</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order number..."
              className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          {orders.length === 0 ? (
            <>
              <p className="mb-4">You have not placed any orders yet.</p>
              <Link to="/products" className="text-amazon-orange hover:underline">Start shopping</Link>
            </>
          ) : (
            <>
              <p className="mb-4">No orders match your filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDateFilter('');
                }}
                className="text-amazon-orange hover:underline"
              >
                Clear filters to see all orders
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
          {filteredOrders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
