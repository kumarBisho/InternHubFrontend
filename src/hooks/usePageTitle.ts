import { useEffect } from 'react';

interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
}

/**
 * Custom hook for managing page title and SEO metadata
 * Automatically updates document title and meta tags
 * 
 * @example
 * usePageTitle({
 *   title: 'Projects - InternHub',
 *   description: 'Manage your internship projects',
 *   keywords: ['projects', 'internship', 'management']
 * });
 */
export function usePageTitle(metadata: PageMetadata) {
  const {
    title,
    description,
    keywords = [],
    ogImage,
    ogUrl,
  } = metadata;

  // Update browser title
  useEffect(() => {
    document.title = title;
  }, [title]);

  return {
    title,
    description,
    keywords,
    ogImage,
    ogUrl,
  };
}

// Export SEOHead component - moved to separate .tsx file
export { SEOHead } from './SEOHead';

