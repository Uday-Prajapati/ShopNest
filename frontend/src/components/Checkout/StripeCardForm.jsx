import { useState } from 'react';

/**
 * Stripe card form placeholder.
 * For full Stripe integration: use @stripe/react-stripe-js with Elements,
 * load publishable key from env, and create PaymentIntent on backend.
 * Backend currently supports COD and WALLET only; CARD creates order with PENDING payment.
 */
export default function StripeCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  return (
    <div className="space-y-3 text-sm">
      <p className="text-gray-600">
        Card payment (test mode). Your order will be created with pending payment status.
        Full Stripe integration requires backend PaymentIntent endpoint.
      </p>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Card number</label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Expiry (MM/YY)</label>
          <input
            type="text"
            placeholder="12/25"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">CVC</label>
          <input
            type="text"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
