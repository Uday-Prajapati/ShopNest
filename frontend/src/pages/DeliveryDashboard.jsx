import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function DeliveryDashboard() {
  const { isDeliveryAgent } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [earningsToday, setEarningsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDeliveryAgent) {
      navigate('/');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [assigned, earnings] = await Promise.all([
          api.getOrdersByStatus('SHIPPED'),
          api.getTodayDeliveryEarnings(),
        ]);
        setDeliveries(Array.isArray(assigned) ? assigned : assigned?.content || []);
        setEarningsToday(earnings || 0);
      } catch (e) {
        setError(e.message || 'Failed to load deliveries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDeliveryAgent, navigate]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: updated.status } : d)),
      );
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  if (!isDeliveryAgent) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Delivery Dashboard</h1>
      <p className="text-sm text-gray-700 mb-4">
        Today&apos;s earnings: <span className="font-semibold">₹{earningsToday.toFixed(2)}</span>
      </p>
      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : deliveries.length === 0 ? (
        <p className="text-gray-600">No deliveries assigned currently.</p>
      ) : (
        <ul className="space-y-3">
          {deliveries.map((d) => (
            <li key={d.id} className="bg-white rounded shadow border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{d.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    Status: {d.status} • Amount: ₹{(d.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer: {d.customerName} • {d.deliveryAddress}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => updateStatus(d.id, 'OUT_FOR_DELIVERY')}
                    className="text-xs px-3 py-1 bg-amazon-orange text-amazon-dark rounded"
                  >
                    Out for Delivery
                  </button>
                  <button
                    onClick={() => updateStatus(d.id, 'DELIVERED')}
                    className="text-xs px-3 py-1 bg-emerald-500 text-white rounded"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

