'use client';
import { useEffect, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { getSecret } from '@/lib/store/secrets';
import {
  fetchContributions,
  fetchGitHubStats,
  colorToAccentPct,
  type GitHubContributions,
  type GitHubStats,
} from '@/lib/github/github';

type GitHubStatus = 'idle' | 'loading' | 'ok' | 'no-token' | 'network-error' | 'rate-limited';

export function GitHubWidget({ state, onChange: _onChange }: WidgetProps) {
  const [status, setStatus] = useState<GitHubStatus>('idle');
  const [contributions, setContributions] = useState<GitHubContributions | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadToken() {
      const token = await getSecret('github_token');
      if (cancelled) return;
      if (!token || !state.githubUsername) {
        setStatus('no-token');
        return;
      }
      setStatus('loading');
      try {
        const [contrib, st] = await Promise.all([
          fetchContributions(state.githubUsername, token),
          fetchGitHubStats(state.githubUsername, token),
        ]);
        if (!cancelled) {
          setContributions(contrib);
          setStats(st);
          setStatus('ok');
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : '';
          setStatus(msg === 'rate-limited' ? 'rate-limited' : 'network-error');
        }
      }
    }
    loadToken();
    return () => { cancelled = true; };
  }, [state.githubUsername]);

  if (status === 'no-token' || status === 'idle') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          connect GitHub — add your personal access token in settings
        </span>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span
          className="glance-skeleton inline-block"
          style={{ width: '12rem', height: '1.2rem', borderRadius: '0.5rem' }}
          aria-label="loading GitHub data"
        />
      </div>
    );
  }

  if (status === 'rate-limited') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span style={{ color: 'var(--glance-muted)' }} className="text-sm">
          GitHub rate limit exceeded — try again later
        </span>
      </div>
    );
  }

  if (status === 'network-error') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span style={{ color: 'var(--glance-muted)' }} className="text-sm">
          GitHub unavailable — check your connection
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Contribution graph */}
      {contributions && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
            gap: '2px',
          }}
        >
          {contributions.weeks.map((week, wi) =>
            week.days.map((day, di) => {
              const pct = colorToAccentPct(day.color);
              return (
                <div
                  key={`${wi}-${di}`}
                  title={`${day.date}: ${day.count} contributions`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor:
                      pct === 0
                        ? 'color-mix(in oklab, var(--glance-accent) 8%, transparent)'
                        : `color-mix(in oklab, var(--glance-accent) ${pct}%, transparent)`,
                  }}
                />
              );
            }),
          )}
        </div>
      )}

      {/* Stats */}
      {stats && contributions && (
        <div className="text-xs" style={{ color: 'var(--glance-muted)' }}>
          {stats.openPRCount} open PRs · {stats.recentCommits} recent commits · {contributions.totalContributions} contributions
        </div>
      )}
    </div>
  );
}
