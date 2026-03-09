import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AuthGuard from '../components/AuthGuard';
import { useToast } from '../context/ToastContext';

function WalletContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    paymentMethod: 'CARD',
  });
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    if (!user?.username) return;
    loadWalletData();
  }, [user?.username]);

  const loadWalletData = async () => {
    try {
      const [balanceData, transactionsData, statsData] = await Promise.all([
        api.getWalletBalance(user.username),
        api.getWalletTransactions(user.username),
        api.getWalletStats(user.username),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.content || []);
      setStats(statsData);
    } catch (e) {
      // Try to create wallet if it doesn't exist
      try {
        await api.createWallet(user.username);
        setBalance(0);
        setTransactions([]);
        setStats({ totalCredits: 0, totalDebits: 0 });
      } catch (createError) {
        showToast('Failed to load wallet data', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!addMoneyForm.amount || parseFloat(addMoneyForm.amount) <= 0) {
      showToast('Please enter a valid amount', { type: 'error' });
      return;
    }

    setAddingMoney(true);
    try {
      await api.addMoneyToWallet(user.username, parseFloat(addMoneyForm.amount), addMoneyForm.paymentMethod);
      setAddMoneyForm({ amount: '', paymentMethod: 'CARD' });
      setShowAddMoney(false);
      showToast('Money added successfully', { type: 'success' });
      loadWalletData(); // Refresh data
    } catch (e) {
      showToast(e.message || 'Failed to add money', { type: 'error' });
    } finally {
      setAddingMoney(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amazon-dark">My Wallet</h1>
        <button
          onClick={() => setShowAddMoney(true)}
          className="px-4 py-2 bg-amazon-orange text-amazon-dark font-medium rounded hover:bg-amazon-light transition"
        >
          Add Money
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-amazon-dark to-amazon-blue text-white rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Current Balance</p>
            <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Available for Shopping</p>
            <p className="text-xl font-semibold">₹{balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-xl font-bold text-green-600">₹{(stats?.totalCredits || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Debits</p>
              <p className="text-xl font-bold text-red-600">₹{(stats?.totalDebits || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className="text-xl font-bold text-amazon-dark">₹{((stats?.totalCredits || 0) - (stats?.totalDebits || 0)).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-amazon-dark mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    t.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'CREDIT' ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()} · {t.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddMoney(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="font-bold text-lg mb-4">Add Money to Wallet</h3>
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={addMoneyForm.amount}
                    onChange={(e) => setAddMoneyForm({ ...addMoneyForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={addMoneyForm.paymentMethod}
                    onChange={(e) => setAddMoneyForm({ ...addMoneyForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                  >
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMoney(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingMoney}
                    className="px-4 py-2 bg-amazon-orange text-amazon-dark rounded hover:bg-amazon-light disabled:opacity-50"
                  >
                    {addingMoney ? 'Adding...' : 'Add Money'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Wallet() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}