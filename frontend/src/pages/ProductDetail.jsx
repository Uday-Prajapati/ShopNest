import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', headline: '' });

  useEffect(() => {
    if (!id) return;
    api.getProduct(id)
      .then((p) => {
        setProduct(p);
        if (p?.category) {
          api.getByCategory(p.category).then((list) => {
            setRelated((list || []).filter((x) => x.id !== p.id).slice(0, 4));
          }).catch(() => setRelated([]));
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
      
    loadReviews(0);
  }, [id]);

  const loadReviews = async (page = 0) => {
    try {
      const data = await api.getProductReviews(id, page);
      if (page === 0) setReviews(data.content || []);
      else setReviews(prev => [...prev, ...(data.content || [])]);
      setReviewsPage(page);
      setHasMoreReviews(data.content?.length > 0 && !data.last);
    } catch (e) {
      // silently fail or log
    }
  };

  useEffect(() => {
    if (!product) return;
    try {
      const key = 'shopnest_recent_products';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const list = Array.isArray(stored) ? stored : [];
      const withoutCurrent = list.filter((p) => p.id !== product.id);
      const next = [product, ...withoutCurrent].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [product]);

  const handleCheckAvailability = async () => {
    try {
      const res = await api.checkAvailability(id, qty);
      showToast(res.message || 'Items are available!', { type: 'success' });
    } catch (e) {
      showToast(e.message || 'Not enough stock available', { type: 'error' });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await api.addReview(id, reviewForm);
      showToast('Review submitted successfully', { type: 'success' });
      setReviewForm({ rating: 5, comment: '', headline: '' });
      loadReviews(0);
    } catch (e) {
      showToast(e.message || 'Failed to submit review', { type: 'error' });
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await addItem(id, qty);
      showToast('Added to cart', { type: 'success' });
      navigate('/cart');
    } catch (e) {
      showToast(e.message || 'Failed to add to cart', { type: 'error' });
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await addItem(id, qty);
      showToast('Added to cart', { type: 'success' });
      navigate('/checkout');
    } catch (e) {
      showToast(e.message || 'Failed to add to cart', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8 animate-pulse h-96" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/products" className="text-amazon-orange hover:underline">Back to products</Link>
      </div>
    );
  }

  const img = product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/500x500?text=No+Image';
  const price = product.discountedPrice ?? product.price ?? 0;
  const origPrice = product.discountedPrice && product.price ? product.price : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-50">
          <img
            src={img}
            alt={product.name}
            className="max-w-full max-h-96 object-contain"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
          />
        </div>
        <div className="md:w-1/2 p-8">
          <h1 className="text-2xl font-bold text-amazon-dark mb-2">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-gray-600 mb-2">Brand: {product.brand}</p>
          )}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-amazon-dark">₹{price.toLocaleString()}</span>
            {origPrice && (
              <span className="text-gray-500 line-through">₹{origPrice.toLocaleString()}</span>
            )}
          </div>
          {product.averageRating != null && (
            <p className="text-sm text-gray-600 mb-4">
              ★ {product.averageRating.toFixed(1)} ({product.totalReviews || 0} reviews)
            </p>
          )}
          <p className="text-gray-700 mb-6">{product.description || 'No description available.'}</p>
          <p className="text-sm text-gray-500 mb-4">
            Category: {product.category || 'N/A'} | In stock: {product.stockQuantity ?? 'N/A'}
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Qty:</span>
                <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-amazon-orange focus:border-amazon-orange"
                >
                {[...Array(Math.min(10, product.stockQuantity || 1))].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                ))}
                </select>
            </div>
            <button
                onClick={handleCheckAvailability}
                className="text-sm text-amazon-dark border-b border-amazon-dark hover:text-amazon-orange hover:border-amazon-orange transition-colors"
            >
                Check Availability
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-amazon-orange text-amazon-dark font-semibold px-6 py-2 rounded hover:bg-amazon-light transition"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-yellow-400 text-amazon-dark font-semibold px-6 py-2 rounded hover:bg-yellow-300 transition"
            >
              Buy Now
            </button>
          </div>
          <Link to="/products" className="inline-block mt-4 text-amazon-orange hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
      {/* Reviews Section */}
      <section className="mt-12 bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-amazon-dark mb-6">Customer Reviews</h2>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/3">
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 border-none text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Headline</label>
                <input
                  type="text"
                  required
                  value={reviewForm.headline}
                  onChange={(e) => setReviewForm({ ...reviewForm, headline: e.target.value })}
                  placeholder="What's most important to know?"
                  className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Add a written review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="What did you like or dislike?"
                  className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amazon-orange text-amazon-dark font-semibold px-4 py-2 rounded hover:bg-amazon-light transition"
              >
                Submit Review
              </button>
            </form>
          </div>
          <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-10">
            <h3 className="font-semibold text-lg mb-4">
              {reviews.length > 0 ? `Top Reviews` : `No reviews yet`}
            </h3>
            <div className="space-y-6">
              {reviews.map((r) => (
                <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={`https://ui-avatars.com/api/?name=${r.username || 'User'}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full" />
                    <span className="font-medium text-amazon-dark">{r.username}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < (r.rating || 5) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{r.headline}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{r.comment}</p>
                </div>
              ))}
              {hasMoreReviews && (
                <button
                  onClick={() => loadReviews(reviewsPage + 1)}
                  className="w-full py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50"
                >
                  Load More Reviews
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-amazon-dark mb-4">Customers also bought</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
