import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Toys'];
const BRANDS = ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Adidas', 'Puma', 'Boat'];
const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  const min = searchParams.get('min');
  const max = searchParams.get('max');
  const brand = searchParams.get('brand') || '';
  const rating = searchParams.get('rating');
  const sort = searchParams.get('sort') || 'createdAt_desc';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        let res = [];
        if (q) {
          res = await api.search(q);
        } else if (cat) {
          res = await api.getByCategory(cat);
        } else if (brand) {
          res = await api.getByBrand(brand);
        } else if (min != null && max != null) {
          res = await api.filterByPrice(Number(min), Number(max));
        } else if (rating != null) {
          res = await api.filterByRating(Number(rating));
        } else {
          res = await api.getProducts();
        }
        res = res || [];

        // Apply additional client-side filters when combining
        if (brand) {
          res = res.filter((p) => (p.brand || '').toLowerCase() === brand.toLowerCase());
        }
        if (rating != null) {
          const minRating = Number(rating);
          res = res.filter((p) => (p.averageRating || 0) >= minRating);
        }

        const [sortBy, dir] = (sort || 'createdAt_desc').split('_');
        if (sortBy === 'price') {
          res.sort((a, b) => {
            const pa = a.discountedPrice ?? a.price ?? 0;
            const pb = b.discountedPrice ?? b.price ?? 0;
            return dir === 'asc' ? pa - pb : pb - pa;
          });
        } else {
          res.sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dir === 'asc' ? ta - tb : tb - ta;
          });
        }
        setProducts(res);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, cat, min, max, brand, rating, sort]);

  const updateFilters = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
             <svg className="w-5 h-5 text-amazon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
             </svg>
             <h3 className="font-bold text-lg text-gray-900">Filters</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Category</p>
              <select
                value={cat}
                onChange={(e) => updateFilters('cat', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange outline-none transition-shadow cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Price Range</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={min || ''}
                  onChange={(e) => updateFilters('min', e.target.value || null)}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={max || ''}
                  onChange={(e) => updateFilters('max', e.target.value || null)}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Brand</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${!brand ? 'bg-amazon-orange border-amazon-orange' : 'border-gray-300 group-hover:border-amazon-orange'}`}>
                    {!brand && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                  </div>
                  <input type="radio" className="hidden" name="brand_filter" checked={!brand} onChange={() => updateFilters('brand', '')} />
                  <span className={`text-sm ${!brand ? 'font-medium text-amazon-dark' : 'text-gray-600 group-hover:text-amazon-dark'}`}>All Brands</span>
                </label>
                {BRANDS.map((b) => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${brand === b ? 'bg-amazon-orange border-amazon-orange' : 'border-gray-300 group-hover:border-amazon-orange'}`}>
                       {brand === b && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                    </div>
                    <input type="radio" className="hidden" name="brand_filter" checked={brand === b} onChange={() => updateFilters('brand', b)} />
                    <span className={`text-sm ${brand === b ? 'font-medium text-amazon-dark' : 'text-gray-600 group-hover:text-amazon-dark'}`}>{b}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Customer Rating</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!rating ? 'border-amazon-orange' : 'border-gray-300 group-hover:border-amazon-orange'}`}>
                    {!rating && <div className="w-2 h-2 rounded-full bg-amazon-orange"></div>}
                  </div>
                  <input type="radio" className="hidden" name="rating_filter" checked={!rating} onChange={() => updateFilters('rating', '')} />
                  <span className={`text-sm ${!rating ? 'font-medium text-amazon-dark' : 'text-gray-600 group-hover:text-amazon-dark'}`}>Any rating</span>
                </label>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${rating === String(r) ? 'border-amazon-orange' : 'border-gray-300 group-hover:border-amazon-orange'}`}>
                        {rating === String(r) && <div className="w-2 h-2 rounded-full bg-amazon-orange"></div>}
                     </div>
                     <input type="radio" className="hidden" name="rating_filter" checked={rating === String(r)} onChange={() => updateFilters('rating', String(r))} />
                     <div className="flex items-center gap-1">
                       <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                             <svg key={i} className={`w-4 h-4 ${i < r ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                       </div>
                       <span className={`text-sm ${rating === String(r) ? 'font-medium text-amazon-dark' : 'text-gray-600 group-hover:text-amazon-dark'}`}>& up</span>
                     </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-amazon-dark">
            {(() => {
              const parts = [];
              if (q) parts.push(`Search: "${q}"`);
              else if (cat) parts.push(`Category: ${cat}`);
              else if (min != null && max != null) parts.push(`Price: ₹${min} - ₹${max}`);
              else parts.push('All Products');
              if (brand) parts.push(`Brand: ${brand}`);
              if (rating != null) parts.push(`${rating}★ & up`);
              return parts.join(' · ');
            })()}
          </h1>
          <select
            value={sort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
