import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import AuthGuard from '../components/AuthGuard';
import StripeCardForm from '../components/Checkout/StripeCardForm';

const STEPS = ['Address', 'Payment', 'Review'];

function CheckoutContent() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: true,
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [phoneNumber, setPhoneNumber] = useState(user?.username ? '' : '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [walletBalance, setWalletBalance] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    if (user?.username) {
      api.getWalletBalance(user.username)
         .then(setWalletBalance)
         .catch(() => setWalletBalance(null));
    }
  }, [user?.username]);

  useEffect(() => {
    if (!user?.username) return;
    api.getProfileByUsername(user.username).then((p) => {
      setProfile(p);
      setAddresses(p?.addresses || []);
      setSelectedAddress(p?.addresses?.find((a) => a.isDefault) || p?.addresses?.[0]);
      setPhoneNumber(p?.mobileNumber || '');
    }).catch(() => setProfile(null));
  }, [user?.username]);

  const items = cart?.items || [];
  const subtotal = cart?.totalPrice ?? 0;
  const tax = subtotal * 0.05;
  const shipping = subtotal === 0 ? 0 : (shippingMethod === 'express' ? 100 : 40);
  const total = Math.max(0, subtotal + tax + shipping - promoDiscount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'SHOPNEST50') {
      setPromoDiscount(50);
      setError('');
    } else if (promoCode.toUpperCase() === 'WELCOME200') {
      setPromoDiscount(200);
      setError('');
    } else {
      setPromoDiscount(0);
      setError('Invalid or expired promo code');
    }
  };

  const canProceedAddress = () => {
    if (selectedAddress) return true;
    const a = newAddress;
    return !!(a.addressLine1 && a.city && a.state && a.postalCode && a.country);
  };

  const handleAddAddress = async () => {
    if (!profile?.id) return;
    setError('');
    try {
      await api.addAddress(profile.id, newAddress);
      const p = await api.getProfileByUsername(user.username);
      setProfile(p);
      setAddresses(p?.addresses || []);
      setSelectedAddress(p?.addresses?.slice(-1)[0]);
      setNewAddress({ ...newAddress, addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' });
    } catch (e) {
      setError(e.message || 'Failed to add address');
    }
  };

  const getShippingAddressStr = () => {
    if (selectedAddress) {
      return `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postalCode}, ${selectedAddress.country}`;
    }
    const a = newAddress;
    return `${a.addressLine1}, ${a.city}, ${a.state} - ${a.postalCode}, ${a.country}`;
  };

  const handlePlaceOrder = async (stripePayload = null) => {
    setError('');
    setLoading(true);
    try {
      const orderPayload = {
        userId: user.username,
        paymentMethod: paymentMethod === 'CARD' ? 'CARD' : paymentMethod,
        phoneNumber: phoneNumber || profile?.mobileNumber || '0000000000',
        notes,
        shippingAddress: getShippingAddressStr(),
        billingAddress: getShippingAddressStr(),
      };
      const order = await api.createOrder(orderPayload);
      refreshCart();
      navigate(`/orders/${order.id}?confirmed=1`);
    } catch (e) {
      setError(e.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amazon-dark mb-6">Checkout</h1>
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i < step || (i === 1 && step === 1) ? setStep(i) : null}
            className={`px-4 py-2 rounded ${i === step ? 'bg-amazon-orange text-amazon-dark' : i < step ? 'bg-gray-300' : 'bg-gray-100'}`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {step === 0 && (
        <div className="bg-white rounded-lg shadow border p-6 space-y-6">
          <h2 className="font-bold text-lg">Shipping Address</h2>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className="flex items-start gap-3 p-3 border rounded cursor-pointer">
                  <input
                    type="radio"
                    name="addr"
                    checked={selectedAddress?.id === a.id}
                    onChange={() => setSelectedAddress(a)}
                  />
                  <span>
                    {a.addressLine1}, {a.city}, {a.state} - {a.postalCode}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div>
            <h3 className="font-medium mb-2">Or add new address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Address Line 1"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                className="md:col-span-2 px-3 py-2 border rounded"
              />
              <input
                placeholder="Address Line 2"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                className="md:col-span-2 px-3 py-2 border rounded"
              />
              <input
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                placeholder="Postal Code"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="px-3 py-2 border rounded"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAddress}
              className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add Address
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10 digits"
              maxLength={10}
              className="w-full md:w-48 px-3 py-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={() => canProceedAddress() && setStep(1)}
            disabled={!canProceedAddress()}
            className="bg-amazon-orange text-amazon-dark font-semibold px-6 py-2 rounded hover:bg-amazon-light disabled:opacity-50"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-lg shadow border p-6 space-y-6">
          <h2 className="font-bold text-lg">Payment Method</h2>
          <div className="space-y-2">
            {['COD', 'WALLET', 'CARD'].map((pm) => (
              <label key={pm} className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-colors ${paymentMethod === pm ? 'border-amazon-orange bg-orange-50/30' : 'hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="pay"
                  className="text-amazon-orange focus:ring-amazon-orange"
                  checked={paymentMethod === pm}
                  onChange={() => setPaymentMethod(pm)}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {pm === 'COD' && 'Cash on Delivery'}
                    {pm === 'WALLET' && 'ShopNest Wallet'}
                    {pm === 'CARD' && 'Credit/Debit Card (Stripe)'}
                  </span>
                  {pm === 'WALLET' && walletBalance !== null && (
                     <p className={`text-sm mt-1 ${walletBalance < total ? 'text-red-500' : 'text-green-600'}`}>
                        Available Balance: ₹{walletBalance.toLocaleString()} {walletBalance < total && '(Insufficient for this order)'}
                     </p>
                  )}
                </div>
              </label>
            ))}
          </div>
          {paymentMethod === 'CARD' && (
            <div className="border rounded p-4">
              <StripeCardForm />
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="bg-amazon-orange text-amazon-dark font-semibold px-6 py-2 rounded hover:bg-amazon-light"
          >
            Continue to Review
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow border p-6 space-y-6">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div>
            <p className="text-sm text-gray-600">Shipping to:</p>
            <p className="font-medium">{getShippingAddressStr()}</p>
            <p className="text-sm mt-1">Phone: {phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium mb-2">Items ({items.length})</p>
            <ul className="space-y-1 text-sm">
              {items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity} — ₹{((i.price || 0) * (i.quantity || 1)).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium mb-3 border-b pb-2">Shipping Method</p>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-between p-3 border rounded cursor-pointer ${shippingMethod === 'standard' ? 'border-amazon-orange bg-orange-50/30' : ''}`}>
                 <div className="flex items-center gap-2">
                   <input type="radio" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                   <span className="font-medium text-sm">Standard (3-5 days)</span>
                 </div>
                 <span className="text-sm font-bold">₹40</span>
              </label>
              <label className={`flex-1 flex items-center justify-between p-3 border rounded cursor-pointer ${shippingMethod === 'express' ? 'border-amazon-orange bg-orange-50/30' : ''}`}>
                 <div className="flex items-center gap-2">
                   <input type="radio" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                   <span className="font-medium text-sm">Express (1-2 days)</span>
                 </div>
                 <span className="text-sm font-bold">₹100</span>
              </label>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Promo Code</p>
            <div className="flex gap-2">
               <input
                 type="text"
                 value={promoCode}
                 onChange={(e) => setPromoCode(e.target.value)}
                 placeholder="Enter code (e.g. SHOPNEST50)"
                 className="flex-1 px-3 py-2 border rounded text-sm uppercase"
               />
               <button type="button" onClick={handleApplyPromo} className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium text-sm hover:bg-gray-300">
                 Apply
               </button>
            </div>
            {promoDiscount > 0 && (
               <p className="text-green-600 text-sm mt-1 font-medium">Promo code applied! Saved ₹{promoDiscount}</p>
            )}
          </div>
          <div className="space-y-2 text-sm bg-gray-50 p-4 rounded border">
            <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Shipping ({shippingMethod})</span><span>₹{shipping}</span></div>
            {promoDiscount > 0 && (
               <div className="flex justify-between text-green-600 font-medium"><span>Promo Discount</span><span>-₹{promoDiscount}</span></div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span><span className="text-amazon-dark">₹{total.toFixed(0)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Order notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={() => handlePlaceOrder()}
            disabled={loading}
            className="w-full bg-amazon-orange text-amazon-dark font-semibold py-3 rounded hover:bg-amazon-light disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
