import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', slug: 'Electronics', icon: '📱' },
  { name: 'Fashion', slug: 'Fashion', icon: '👕' },
  { name: 'Home & Kitchen', slug: 'Home', icon: '🏠' },
  { name: 'Books', slug: 'Books', icon: '📚' },
];

const HERO_SLIDES = [
  { title: 'Big Deals on Electronics', subtitle: 'Up to 40% off on selected items', cta: 'Shop Electronics', link: '/products?cat=Electronics' },
  { title: 'New Arrivals', subtitle: 'Discover the latest trends', cta: 'Shop Now', link: '/products' },
  { title: 'Free Shipping', subtitle: 'On orders over ₹999', cta: 'Explore', link: '/products' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [inspired, setInspired] = useState([]);

  useEffect(() => {
    api.getFeatured().then(setFeatured).catch(() => setFeatured([]));
    api.getProducts().then((list) => {
      const discounted = (list || []).filter((p) => p.discountedPrice && p.discountedPrice < p.price);
      setDeals(discounted.slice(0, 8));
    }).catch(() => setDeals([]));
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shopnest_recent_products') || '[]');
      if (Array.isArray(stored)) {
        setRecent(stored);
        const categories = Array.from(new Set(stored.map((p) => p.category).filter(Boolean)));
        if (categories.length > 0) {
          api.getProducts()
            .then((list) => {
              const all = list || [];
              const filtered = all.filter(
                (p) =>
                  categories.includes(p.category) &&
                  !stored.some((r) => r.id === p.id),
              );
              setInspired(filtered.slice(0, 8));
            })
            .catch(() => setInspired([]));
        }
      }
    } catch {
      setRecent([]);
      setInspired([]);
    }
  }, []);

  const slide = HERO_SLIDES[heroIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero carousel */}
      <section className="relative bg-gradient-to-r from-amazon-dark via-amazon-blue to-amazon-dark text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
            <p className="text-xl text-gray-200 mb-6">{slide.subtitle}</p>
            <Link
              to={slide.link}
              className="inline-block bg-amazon-orange text-amazon-dark font-semibold px-6 py-3 rounded hover:bg-amazon-light transition"
            >
              {slide.cta}
            </Link>
          </div>
          <div className="hidden md:flex gap-2 absolute right-8 bottom-4">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`w-2 h-2 rounded-full transition ${i === heroIndex ? 'bg-amazon-orange scale-125' : 'bg-gray-500'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-amazon-dark mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/products?cat=${encodeURIComponent(c.slug)}`}
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg hover:border-amazon-orange/50 border border-transparent transition"
            >
              <span className="text-4xl block mb-2">{c.icon}</span>
              <span className="font-medium text-gray-900">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals / Discounted */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-amazon-dark mb-4">Today&apos;s Deals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <h2 className="text-2xl font-bold text-amazon-dark mb-4">Featured Products</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No featured products yet. <Link to="/products" className="text-amazon-orange hover:underline">Browse all</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-amazon-dark mb-4">Recently viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Inspired by your browsing */}
      {inspired.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-amazon-dark mb-4">Inspired by your browsing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {inspired.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
