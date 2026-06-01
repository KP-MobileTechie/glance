'use client';
import { useEffect, useRef, useState } from 'react';
import type { SearchEngine } from '@/lib/store/types';
import { buildSearchUrl } from '@/lib/search/search';

export interface SearchBarProps {
  engine: SearchEngine;
  onNavigate?: (url: string) => void;
}

const ENGINE_LABEL: Record<SearchEngine, string> = {
  google: 'Google',
  duckduckgo: 'DuckDuckGo',
  bing: 'Bing',
  brave: 'Brave',
};

export function SearchBar({ engine, onNavigate }: SearchBarProps) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const navigate = onNavigate ?? ((url: string) => { window.location.href = url; });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const url = buildSearchUrl(q, engine);
    if (url) navigate(url);
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="glance-search">
        <button type="submit" aria-label="submit search" className="glance-search-btn">&#9906;</button>
        <input
          ref={ref}
          type="search"
          role="searchbox"
          aria-label="search"
          placeholder="search the web, or type a url"
          className="w-full bg-transparent outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="glance-search-engine" aria-hidden="true">{ENGINE_LABEL[engine]}</span>
      </div>
    </form>
  );
}
