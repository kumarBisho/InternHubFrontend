import { Suspense, type ReactNode } from 'react';

/**
 * Loading fallback component displayed while page is loading
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <p className="text-lg text-gray-700 font-medium">Loading...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare the page</p>
      </div>
    </div>
  );
}

interface RouteLoaderProps {
  children: ReactNode;
}

/**
 * RouteLoader wraps route components with Suspense for async loading
 * Displays a loading state while the component is being loaded
 */
export default function RouteLoader({ children }: RouteLoaderProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}
