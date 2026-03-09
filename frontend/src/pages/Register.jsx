import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    mobileNumber: '',
    role: 'ROLE_CUSTOMER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleHome = (r) => {
    if (r === 'ROLE_ADMIN') return '/admin/dashboard';
    if (r === 'ROLE_DELIVERY_AGENT') return '/delivery/dashboard';
    if (r === 'ROLE_MERCHANT') return '/merchant/dashboard';
    return '/';
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({
        username: form.username,
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        mobileNumber: form.mobileNumber || undefined,
        roles: [form.role],
      });
      await login(form.username, form.password);
      try {
        await api.createProfile({
          username: form.username,
          email: form.email,
          fullName: form.fullName || form.username,
          mobileNumber: form.mobileNumber || '0000000000',
          role: form.role,
        });
      } catch (_) {}
      navigate(roleHome(form.role));
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-amazon-dark mb-6">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile (10 digits)</label>
              <input
                type="text"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange"
              >
                <option value="ROLE_CUSTOMER">Customer</option>
                <option value="ROLE_MERCHANT">Merchant</option>
                <option value="ROLE_DELIVERY_AGENT">Delivery Agent</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amazon-orange text-amazon-dark font-semibold py-2 rounded hover:bg-amazon-light transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-amazon-orange hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
