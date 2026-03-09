import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-amazon-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amazon-light">About Us</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Careers</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Press Releases</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">ShopNest Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-amazon-light">All Products</Link></li>
              <li><Link to="/products?cat=Electronics" className="hover:text-amazon-light">Electronics</Link></li>
              <li><Link to="/products?cat=Fashion" className="hover:text-amazon-light">Fashion</Link></li>
              <li><Link to="/products?cat=Home" className="hover:text-amazon-light">Home & Kitchen</Link></li>
              <li><Link to="/best-sellers" className="hover:text-amazon-light">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amazon-light">FAQs</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Returns & Replacements</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Shipping Information</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Policy</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amazon-light">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Terms of Use</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Refund Policy</Link></li>
              <li><Link to="/" className="hover:text-amazon-light">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amazon-orange font-bold text-xl">ShopNest</span>
            <span className="text-sm">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-amazon-light">Facebook</a>
            <a href="#" className="hover:text-amazon-light">Twitter</a>
            <a href="#" className="hover:text-amazon-light">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
