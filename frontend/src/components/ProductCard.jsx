import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const img = product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
  const price = product.discountedPrice ?? product.price ?? 0;
  const origPrice = product.discountedPrice && product.price ? product.price : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 block h-full border border-gray-200 hover:border-amazon-orange/50"
    >
      <div className="aspect-square mb-2 overflow-hidden rounded bg-gray-100">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />
      </div>
      <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">{product.name}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-amazon-dark font-bold">₹{price.toLocaleString()}</span>
        {origPrice && (
          <span className="text-gray-500 text-sm line-through">₹{origPrice.toLocaleString()}</span>
        )}
      </div>
      {product.averageRating != null && (
        <p className="text-xs text-gray-600 mt-1">
          ★ {product.averageRating.toFixed(1)} ({product.totalReviews || 0} reviews)
        </p>
      )}
    </Link>
  );
}
