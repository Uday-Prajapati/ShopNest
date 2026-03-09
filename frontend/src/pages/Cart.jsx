import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';

function CartContent() {
  const { cart, loading, updateQuantity, removeItem, addItem } = useCart();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  
  useEffect(() => {
    if (user?.username) {
      try {
        const stored = JSON.parse(localStorage.getItem(`shopnest_saved_${user.username}`) || '[]');
        setSavedItems(stored);
      } catch { setSavedItems([]); }
    }
  }, [user?.username]);

  const handleSaveForLater = async (item) => {
    if (!user?.username) return;
    try {
      await removeItem(item.id);
      const next = [...savedItems, item];
      setSavedItems(next);
      localStorage.setItem(`shopnest_saved_${user.username}`, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const handleMoveToCart = async (item) => {
    if (!user?.username) return;
    try {
      await addItem(item.productId, item.quantity || 1);
      const next = savedItems.filter((x) => x.id !== item.id);
      setSavedItems(next);
      localStorage.setItem(`shopnest_saved_${user.username}`, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const handleRemoveSaved = (id) => {
    if (!user?.username) return;
    const next = savedItems.filter((x) => x.id !== id);
    setSavedItems(next);
    localStorage.setItem(`shopnest_saved_${user.username}`, JSON.stringify(next));
  };

  const items = cart?.items || [];
  const total = cart?.totalPrice ?? 0;
  const subtotal = total;
  const totalSavings = items.reduce((sum, item) => {
     const orig = item.originalPrice || item.price;
     return sum + ((orig - item.price) * (item.quantity || 1));
  }, 0);
  const tax = subtotal * 0.05;
  const shipping = subtotal > 0 ? 40 : 0;
  const grandTotal = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
           <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
           </svg>
           <h2 className="text-3xl font-bold text-amazon-dark mb-3">Your cart is empty</h2>
           <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything yet.</p>
           <Link
             to="/products"
             className="inline-block bg-gradient-to-r from-amazon-orange to-yellow-500 text-amazon-dark font-bold px-8 py-4 rounded-full hover:shadow-lg transition-all"
           >
             Start Shopping Now
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amazon-dark mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow border p-8 text-center text-gray-500 uppercase tracking-wide text-sm font-semibold">
              No items in cart
            </div>
          ) : items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
            >
              <div className="shrink-0 relative">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                  alt={item.productName}
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg border border-gray-50 p-2"
                />
                {item.originalPrice > item.price && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to={`/products/${item.productId}`} className="font-semibold text-lg text-amazon-dark hover:text-amazon-orange transition-colors truncate mb-1">
                  {item.productName}
                </Link>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-xl font-bold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  {item.originalPrice > item.price && (
                    <p className="text-sm line-through text-gray-400">₹{(item.originalPrice * item.quantity).toLocaleString()}</p>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-md bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                      className="w-8 h-8 rounded-l text-gray-600 hover:bg-gray-200 focus:outline-none"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="w-8 h-8 rounded-r text-gray-600 hover:bg-gray-200 focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                  <button
                    onClick={() => handleSaveForLater(item)}
                    className="text-amazon-dark text-sm font-medium hover:text-amazon-orange hover:underline transition-colors"
                  >
                    Save for later
                  </button>
                  <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm font-medium hover:text-red-600 hover:underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {savedItems.length > 0 && (
             <div className="mt-12">
               <h2 className="text-xl font-bold text-amazon-dark mb-4 border-b pb-2">Saved for Later ({savedItems.length} items)</h2>
               <div className="space-y-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                      <img src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'} alt={item.productName} className="w-20 h-20 object-contain rounded bg-white p-1" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link to={`/products/${item.productId}`} className="font-medium text-amazon-dark truncate mb-1">
                          {item.productName}
                        </Link>
                        <p className="font-bold text-gray-900 mb-2">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                        <div className="flex items-center gap-4 text-sm mt-auto">
                          <button onClick={() => handleMoveToCart(item)} className="text-amazon-orange font-medium hover:underline">
                            Move to Cart
                          </button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleRemoveSaved(item.id)} className="text-red-500 font-medium hover:underline">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
        </div>
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-xl text-gray-900 mb-6 border-b pb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({items.length} items)</span><span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span></div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600 font-medium"><span>Discount</span><span>-₹{totalSavings.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span className="font-medium text-gray-900">₹{tax.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-medium text-gray-900">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              
              <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4 border-gray-200">
                <span>Total Amount</span><span className="text-amazon-dark">₹{grandTotal.toFixed(0)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="text-xs text-green-600 text-right font-medium bg-green-50 p-2 rounded mt-2">
                   You will save ₹{totalSavings.toLocaleString()} on this order
                </div>
              )}
            </div>
            <Link
              to="/checkout"
              className={`block w-full text-center bg-gradient-to-r from-amazon-orange to-yellow-400 text-amazon-dark font-bold py-3.5 rounded-full hover:shadow-lg transition-all ${items.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Proceed to Checkout
            </Link>
            <Link to="/products" className="block text-center text-sm text-amazon-orange mt-2 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}
