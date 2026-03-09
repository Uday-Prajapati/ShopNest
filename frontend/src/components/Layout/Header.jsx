import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../Cart/CartDrawer';

export default function Header() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const searchDebounce = useRef(null);
  const dropdownRef = useRef(null);
  const { user, logout, isLoggedIn, isMerchant, isAdmin, isDeliveryAgent } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchDebounce.current = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(val.trim())}`)
        .then((r) => r.json())
        .then((list) => {
          setSuggestions(Array.isArray(list) ? list.slice(0, 5) : []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search.trim())}`);
  };

  const selectSuggestion = (p) => {
    setSearch(p.name);
    setShowSuggestions(false);
    navigate(`/products/${p.id}`);
  };

  return (
    <header className="bg-amazon-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-2">
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl font-bold text-amazon-orange">ShopNest</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search products..."
              className="flex-1 px-3 py-2 rounded-l text-amazon-dark"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amazon-orange rounded-r hover:bg-amazon-light text-amazon-dark"
            >
              Search
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white text-amazon-dark rounded shadow-lg border border-gray-200 z-10 overflow-hidden">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => selectSuggestion(p)}
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-8 h-8 object-contain" />
                    )}
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-amazon-orange font-medium">
                      ₹{((p.discountedPrice ?? p.price) || 0).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <nav className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1 px-3 py-2 rounded hover:bg-amazon-blue transition"
                >
                  <span className="text-sm">Hello, {user?.username}</span>
                  <span className="text-xs">▼</span>
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white text-amazon-dark rounded shadow-lg py-1 z-20">
                    {!isAdmin && !isDeliveryAgent && (
                      <>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setUserDropdown(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setUserDropdown(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/wallet"
                          className="block px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setUserDropdown(false)}
                        >
                          My Wallet
                        </Link>
                      </>
                    )}
                    {isMerchant && (
                      <Link
                        to="/merchant/dashboard"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setUserDropdown(false)}
                      >
                        Merchant Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setUserDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {isDeliveryAgent && (
                      <Link
                        to="/delivery/dashboard"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setUserDropdown(false)}
                      >
                        Delivery Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm hover:text-amazon-light transition px-2">
                Sign In
              </Link>
            )}

            {!isDeliveryAgent && !isAdmin && (
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded hover:bg-amazon-blue transition"
              >
                <span>🛒</span>
                <span className="text-amazon-orange font-bold">{itemCount}</span>
              </button>
            )}
          </nav>
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
