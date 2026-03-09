import { Link, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const routeError = useRouteError?.() || null;
  const message =
    (routeError && (routeError.statusText || routeError.message)) ||
    'Something went wrong while loading this page.';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-lg w-full text-center bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400"></div>
        <div className="mb-6 flex justify-center">
            <svg className="w-24 h-24 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 mb-2 tracking-tighter">Oops!</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">An unexpected error occurred.</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100">
            <p className="text-sm font-mono break-words">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:bg-gray-800 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

