import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer({ open, onClose }) {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { isLoggedIn } = useAuth();
  const items = cart?.items || [];
  const total = cart?.totalPrice ?? 0;
  const totalSavings = items.reduce((sum, item) => {
     const orig = item.originalPrice || item.price;
     return sum + ((orig - item.price) * (item.quantity || 1));
  }, 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-amazon-dark">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-amazon-dark"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!isLoggedIn ? (
            <p className="text-gray-500 text-center py-8">
              <Link to="/login" className="text-amazon-orange hover:underline">
                Sign in
              </Link>{' '}
              to view your cart.
            </p>
          ) : loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-2 border rounded-lg"
                >
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'}
                    alt={item.productName}
                    className="w-16 h-16 object-contain rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-amazon-dark font-bold">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                       {item.originalPrice > item.price && (
                         <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                           Save ₹{((item.originalPrice - item.price) * (item.quantity || 1)).toLocaleString()}
                         </span>
                       )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 text-xs hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isLoggedIn && items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            {totalSavings > 0 && (
                <p className="text-right text-sm text-green-600 font-medium mb-1">
                  You save: ₹{totalSavings.toLocaleString()}
                </p>
            )}
            <p className="text-right font-bold text-lg mb-4 text-amazon-dark">
              Subtotal: ₹{total.toLocaleString()}
            </p>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center bg-amazon-orange text-amazon-dark font-semibold py-2 rounded hover:bg-amazon-light"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
