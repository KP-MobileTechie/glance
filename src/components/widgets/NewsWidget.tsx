'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { fetchHNStories, fetchRSSFeed, type NewsItem } from '@/lib/news/news';

type NewsStatus = 'idle' | 'loading' | 'ok' | 'network-error' | 'parse-error';

export function NewsWidget({ state, onChange }: WidgetProps) {
  const [status, setStatus] = useState<NewsStatus>('idle');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [rssInput, setRssInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (cancelled) return;
      setStatus('loading');
      try {
        const result = state.hnConfig.rssUrl
          ? await fetchRSSFeed(state.hnConfig.rssUrl, state.hnConfig.count)
          : await fetchHNStories(state.hnConfig.count);
        if (!cancelled) { setItems(result); setStatus('ok'); }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : '';
          setStatus(msg === 'parse-error' ? 'parse-error' : 'network-error');
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [state.hnConfig.rssUrl, state.hnConfig.count]);

  function submitRssUrl() {
    const url = rssInput.trim();
    if (!url) {
      onChange({ hnConfig: { ...state.hnConfig, rssUrl: null } });
    } else {
      onChange({ hnConfig: { ...state.hnConfig, rssUrl: url } });
    }
    setRssInput('');
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="glance-label">hacker news</div>
      {status === 'loading' ? (
        <span
          className="glance-skeleton inline-block"
          style={{ width: '8rem', height: '1.2rem', borderRadius: '0.5rem' }}
          aria-label="loading stories"
        />
      ) : status === 'network-error' ? (
        <span style={{ color: 'var(--glance-muted)' }} className="text-sm">
          feed unavailable — check your connection
        </span>
      ) : status === 'parse-error' ? (
        <span style={{ color: 'var(--glance-muted)' }} className="text-sm">
          could not parse feed — check the URL
        </span>
      ) : (
        <ul className="glance-scroll flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: 'var(--glance-text)' }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* RSS URL input */}
      <div className="flex gap-2 mt-auto">
        <input
          type="url"
          className="glance-input text-xs flex-1"
          placeholder="Custom RSS URL (leave empty for HN)"
          value={rssInput}
          onChange={(e) => setRssInput(e.target.value)}
        />
        <button type="button" className="glance-chip text-xs" onClick={submitRssUrl}>
          set
        </button>
      </div>
    </div>
  );
}
