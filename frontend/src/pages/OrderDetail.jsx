import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import AuthGuard from '../components/AuthGuard';
import { useToast } from '../context/ToastContext';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const STATUS_LABELS = { PENDING: 'Order Placed', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };

function OrderDetailContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [processingReturn, setProcessingReturn] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const confirmed = new URLSearchParams(window.location.search).get('confirmed') === '1';

  useEffect(() => {
    if (!id) return;
    api.getOrder(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReturn = async () => {
    if (selectedItems.size === 0 || !returnReason.trim()) return;
    setProcessingReturn(true);
    try {
      // Process return for selected items
      const returnData = {
        orderId: order.id,
        items: Array.from(selectedItems).map(itemId => ({
          productId: itemId,
          quantity: order.items.find(i => i.productId === itemId)?.quantity || 1
        })),
        reason: returnReason
      };

      await api.requestReturn(returnData);
      showToast('Return request submitted successfully', { type: 'success' });
      setShowReturnModal(false);
      setSelectedItems(new Set());
      setReturnReason('');
      // Refresh order data
      const updatedOrder = await api.getOrder(Number(id));
      setOrder(updatedOrder);
    } catch (e) {
      showToast(e.message || 'Return request failed', { type: 'error' });
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #232f3e; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #232f3e; }
            .invoice-title { font-size: 18px; margin: 10px 0; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-section { flex: 1; }
            .info-section h3 { margin-bottom: 10px; color: #232f3e; }
            .info-section p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
            .total-label { width: 100px; }
            .total-amount { font-weight: bold; }
            .grand-total { font-size: 18px; border-top: 2px solid #232f3e; padding-top: 10px; margin-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">ShopNest</div>
            <div class="invoice-title">INVOICE</div>
            <div>Order #${order.orderNumber}</div>
          </div>

          <div class="order-info">
            <div class="info-section">
              <h3>Bill To:</h3>
              <p>${user?.username || user?.email || 'Customer'}</p>
              <p>${user?.email || ''}</p>
            </div>
            <div class="info-section">
              <h3>Order Details:</h3>
              <p><strong>Order Date:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Payment:</strong> ${order.paymentMethod} · ${order.paymentStatus}</p>
            </div>
          </div>

          <div class="info-section">
            <h3>Shipping Address:</h3>
            <p>${order.shippingAddress || 'N/A'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>₹${(item.price || 0).toLocaleString()}</td>
                  <td>₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="total-section">
            ${order.subtotal != null ? `<div class="total-row"><span class="total-label">Subtotal:</span> <span>₹${order.subtotal.toLocaleString()}</span></div>` : ''}
            ${order.tax != null ? `<div class="total-row"><span class="total-label">Tax:</span> <span>₹${order.tax.toLocaleString()}</span></div>` : ''}
            ${order.shippingCharge != null ? `<div class="total-row"><span class="total-label">Shipping:</span> <span>₹${order.shippingCharge.toLocaleString()}</span></div>` : ''}
            <div class="total-row grand-total">
              <span class="total-label">Total:</span> <span class="total-amount">₹${(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            Thank you for shopping with ShopNest!
          </div>
        </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.cancelOrder(order?.id, cancelReason);
      showToast('Order cancelled', { type: 'success' });
      setShowCancelModal(false);
      setCancelReason('');
      if (id) {
        const updatedOrder = await api.getOrder(Number(id));
        setOrder(updatedOrder);
      }
    } catch (e) {
      showToast(e.message || 'Failed to cancel order', { type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    for (const item of order?.items || []) {
      try {
        await addItem(item.productId, item.quantity || 1);
      } catch {}
    }
    showToast('Items added to cart', { type: 'success' });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link to="/orders" className="text-amazon-orange hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const statusIndex = STATUS_STEPS.indexOf(order.status);
  const canReturn = order.status === 'DELIVERED' && order.items?.some(item => !item.returnRequested);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {confirmed && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg">
          Order placed successfully! Order #{order.orderNumber}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-amazon-dark">Order #{order.orderNumber}</h1>
        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
            >
              Request Return
            </button>
          )}
          {order.status !== 'CANCELLED' && order.items?.length > 0 && (
            <button
              onClick={handleReorder}
              className="px-4 py-2 bg-amazon-orange text-amazon-dark font-medium rounded hover:bg-amazon-light"
            >
              Reorder
            </button>
          )}
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 border border-amazon-orange text-amazon-orange rounded hover:bg-amazon-orange hover:text-white transition"
          >
            Download Invoice
          </button>
        </div>
      </div>

      {/* Order tracking timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h2 className="font-bold mb-4">Order Tracking</h2>
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" style={{ top: '1.25rem' }} />
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    i <= statusIndex ? 'bg-amazon-orange text-amazon-dark' : 'bg-gray-200'
                  }`}
                >
                  {i < statusIndex ? '✓' : i + 1}
                </div>
                <span className="text-xs mt-2 text-center">{STATUS_LABELS[s] || s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-medium">{order.paymentMethod} · {order.paymentStatus}</p>
            </div>
            <div>
              <p className="text-gray-500">Order Date</p>
              <p>{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Shipping Address</p>
              <p>{order.shippingAddress || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'}
                  alt={item.productName}
                  className="w-20 h-20 object-contain rounded"
                />
                <div className="flex-1">
                  <Link to={`/products/${item.productId}`} className="font-medium text-amazon-dark hover:underline">
                    {item.productName}
                  </Link>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString()} each</p>
                </div>
                <p className="font-bold">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              {order.subtotal != null && (
                <p className="text-sm"><span className="text-gray-500">Subtotal</span> ₹{order.subtotal.toLocaleString()}</p>
              )}
              {order.tax != null && (
                <p className="text-sm"><span className="text-gray-500">Tax</span> ₹{order.tax.toLocaleString()}</p>
              )}
              {order.shippingCharge != null && (
                <p className="text-sm"><span className="text-gray-500">Shipping</span> ₹{order.shippingCharge}</p>
              )}
              <p className="font-bold text-lg">Total: ₹{(order.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Link to="/orders" className="text-amazon-orange hover:underline">← Back to Orders</Link>

      {showCancelModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCancelModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="font-bold text-lg mb-2">Cancel Order</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure? Enter reason (optional):</p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed mind"
                className="w-full px-3 py-2 border rounded mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showReturnModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowReturnModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Request Return</h3>
              <p className="text-sm text-gray-600 mb-4">Select items to return and provide a reason:</p>

              <div className="space-y-3 mb-4">
                {order.items?.filter(item => !item.returnRequested).map((item) => (
                  <label key={item.productId} className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.productId)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedItems);
                        if (e.target.checked) {
                          newSelected.add(item.productId);
                        } else {
                          newSelected.delete(item.productId);
                        }
                        setSelectedItems(newSelected);
                      }}
                      className="mt-1"
                    />
                    <div className="flex gap-3 flex-1">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/60?text=No+Image'}
                        alt={item.productName}
                        className="w-15 h-15 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString()} each</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Defective/Damaged</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="changed_mind">Changed Mind</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedItems(new Set());
                    setReturnReason('');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  disabled={processingReturn || selectedItems.size === 0 || !returnReason}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processingReturn ? 'Processing...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrderDetail() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  );
}
