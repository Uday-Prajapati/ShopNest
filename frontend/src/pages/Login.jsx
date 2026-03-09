import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const roleHome = (role) => {
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_DELIVERY_AGENT') return '/delivery/dashboard';
    if (role === 'ROLE_MERCHANT') return '/merchant/dashboard';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username or email is required.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await login(username, password, rememberMe);
      const role =
        res?.roles && Array.isArray(res.roles) && res.roles.length > 0 ? res.roles[0] : res?.role;
      navigate(from !== '/' ? from : roleHome(role), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-amazon-dark mb-6">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors({ ...fieldErrors, username: '' }); }}
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange outline-none transition-colors ${fieldErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: '' }); }}
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange outline-none transition-colors ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange"
                />
                <span className="text-sm text-gray-600 select-none">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-amazon-orange hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amazon-orange text-amazon-dark font-semibold py-2 rounded hover:bg-amazon-light transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            New to ShopNest? <Link to="/register" className="text-amazon-orange hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
