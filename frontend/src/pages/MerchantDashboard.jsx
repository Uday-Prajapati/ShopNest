import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function MerchantDashboard() {
  const { isMerchant } = useAuth();
  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMerchant) {
      navigate('/');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [prodRes, orderRes] = await Promise.all([
          api.getProducts(),
          api.getOrdersByStatus('PENDING'),
        ]);
        setProducts(Array.isArray(prodRes) ? prodRes : prodRes.content || []);
        setPendingOrders(Array.isArray(orderRes) ? orderRes : orderRes.content || []);
      } catch (e) {
        setError(e.message || 'Failed to load merchant data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isMerchant, navigate]);

  if (!isMerchant) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Merchant Dashboard</h1>
      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">My Products</h2>
              <button
                onClick={() => navigate('/merchant/products/new')}
                className="text-sm px-3 py-1 bg-amazon-orange text-amazon-dark rounded"
              >
                Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-gray-600">No products yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {products.slice(0, 5).map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Stock: {p.stock ?? p.quantity ?? 0} • Price: ₹
                        {((p.discountedPrice ?? p.price) || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/merchant/products/${p.id}/edit`)}
                      className="text-xs text-amazon-orange hover:underline"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Pending Orders</h2>
            </div>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-gray-600">No pending orders.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingOrders.slice(0, 5).map((o) => (
                  <li key={o.id} className="py-2">
                    <p className="font-medium">#{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      Status: {o.status} • Total: ₹{(o.totalAmount || 0).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

