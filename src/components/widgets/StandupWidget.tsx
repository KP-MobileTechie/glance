'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { getSecret } from '@/lib/store/secrets';
import { buildStandupPrompt, selectProvider } from '@/lib/ai/ai';
import { fetchYesterdayCommits } from '@/lib/github/github';

type StandupStatus = 'idle' | 'loading-key' | 'no-key' | 'generating' | 'done' | 'error';

export function StandupWidget({ state, onChange: _onChange }: WidgetProps) {
  const [status, setStatus] = useState<StandupStatus>('loading-key');
  const [draft, setDraft] = useState('');
  const [openaiKey, setOpenaiKey] = useState<string | undefined>(undefined);
  const [anthropicKey, setAnthropicKey] = useState<string | undefined>(undefined);
  const [githubToken, setGithubToken] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadKeys() {
      const [oKey, aKey, ghToken] = await Promise.all([
        getSecret('openai_api_key'),
        getSecret('anthropic_api_key'),
        getSecret('github_token'),
      ]);
      if (cancelled) return;
      setOpenaiKey(oKey);
      setAnthropicKey(aKey);
      setGithubToken(ghToken);
      if (!oKey && !aKey) {
        setStatus('no-key');
      } else {
        setStatus('idle');
      }
    }
    loadKeys();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, []);

  async function handleGenerate() {
    const providerInfo = selectProvider(openaiKey, anthropicKey);
    if (!providerInfo) {
      setStatus('no-key');
      return;
    }

    // Assemble done todos from both state.todos and state.todoLists
    const allTodos = [
      ...state.todos,
      ...state.todoLists.flatMap((l) => l.todos),
    ];
    const doneTodos = allTodos.filter((t) => t.done).map((t) => t.text);

    // Assemble yesterday commits
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let commits: string[] = [];
    if (githubToken && state.githubUsername) {
      commits = await fetchYesterdayCommits(state.githubUsername, githubToken, yesterdayStr);
    }

    const messages = buildStandupPrompt(doneTodos, commits);
    const { provider, model, apiKey } = providerInfo;

    setStatus('generating');
    setDraft('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, messages, apiKey }),
        signal: controller.signal,
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decoded = decoder.decode(value, { stream: true });
        setDraft((current) => current + decoded);
      }

      setStatus('done');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled — do nothing
      } else {
        setStatus('error');
      }
    }
  }

  if (status === 'loading-key') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span
          className="glance-skeleton inline-block"
          style={{ width: '10rem', height: '1.2rem', borderRadius: '0.5rem' }}
          aria-label="loading"
        />
      </div>
    );
  }

  if (status === 'no-key') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          add your API key in settings to use the standup generator
        </span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          failed to generate standup — check your API key
        </span>
        <button
          type="button"
          className="glance-chip text-xs self-start"
          onClick={() => setStatus('idle')}
        >
          retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="glance-label">daily standup</div>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="glance-chip text-xs"
          onClick={handleGenerate}
          disabled={status === 'generating'}
        >
          generate standup
        </button>
        {status === 'generating' && (
          <button
            type="button"
            className="glance-chip text-xs"
            onClick={() => abortRef.current?.abort()}
          >
            cancel
          </button>
        )}
      </div>
      {draft && (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <pre
            className="text-xs overflow-auto flex-1"
            style={{ color: 'var(--glance-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {draft}
          </pre>
          <button
            type="button"
            className="glance-chip text-xs self-start"
            onClick={() => navigator.clipboard.writeText(draft)}
          >
            copy
          </button>
        </div>
      )}
    </div>
  );
}
