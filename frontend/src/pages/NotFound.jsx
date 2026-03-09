import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-lg w-full text-center bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amazon-orange to-yellow-400"></div>
        <div className="mb-6 flex justify-center">
            <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amazon-dark to-gray-600 mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-md text-gray-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amazon-orange to-yellow-500 text-amazon-dark font-bold px-8 py-3 rounded-full hover:shadow-lg hover:from-yellow-500 hover:to-amazon-orange transition-all duration-300 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

