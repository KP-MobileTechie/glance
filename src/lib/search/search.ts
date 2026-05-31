import type { SearchEngine } from '@/lib/store/types';

const ENGINES: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
};

function looksLikeUrl(q: string): boolean {
  if (/\s/.test(q)) return false;
  if (/^https?:\/\//i.test(q)) return true;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(q);
}

export function buildSearchUrl(query: string, engine: SearchEngine): string | null {
  const q = query.trim();
  if (!q) return null;
  if (looksLikeUrl(q)) {
    return /^https?:\/\//i.test(q) ? q : `https://${q}`;
  }
  return ENGINES[engine] + encodeURIComponent(q);
}
