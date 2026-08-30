/**
 * Resolves image URLs with CDN proxy for domains that are blocked or throttled by regional ISPs (such as image.tmdb.org).
 * Also handles fallback URLs gracefully.
 */
export function getOptimizedImageUrl(url: string | null | undefined, fallback = ''): string {
  if (!url || !url.trim()) {
    return fallback;
  }

  const clean = url.trim();

  // Route TMDB images through wsrv.nl (Cloudflare-backed edge image cache)
  // to bypass ISP-level connection timeouts / blocks on image.tmdb.org
  if (clean.includes('image.tmdb.org')) {
    return 'https://wsrv.nl/?url=' + encodeURIComponent(clean) + '&output=webp&q=85';
  }

  return clean;
}
