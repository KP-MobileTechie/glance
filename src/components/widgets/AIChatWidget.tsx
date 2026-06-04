'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetProps } from './ClockWidget';
import { getSecret } from '@/lib/store/secrets';
import { buildChatMessages, selectProvider } from '@/lib/ai/ai';
import type { ChatMessage } from '@/lib/ai/ai';

type ChatStatus = 'loading-key' | 'no-key' | 'idle' | 'streaming' | 'error';

export function AIChatWidget({ state: _state, onChange: _onChange }: WidgetProps) {
  const [status, setStatus] = useState<ChatStatus>('loading-key');
  const [openaiKey, setOpenaiKey] = useState<string | undefined>(undefined);
  const [anthropicKey, setAnthropicKey] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [, setHistoryVersion] = useState(0);
  const historyRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadKeys() {
      const [oKey, aKey] = await Promise.all([
        getSecret('openai_api_key'),
        getSecret('anthropic_api_key'),
      ]);
      if (cancelled) return;
      setOpenaiKey(oKey);
      setAnthropicKey(aKey);
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

  async function handleSend(text: string) {
    if (!text.trim()) return;

    const providerInfo = selectProvider(openaiKey, anthropicKey);
    if (!providerInfo) {
      setStatus('no-key');
      return;
    }

    // Push user message to history
    historyRef.current = [...historyRef.current, { role: 'user', content: text }];
    setHistoryVersion(v => v + 1);
    setInputText('');

    // Build messages array — historyRef already contains the user message
    const messages = buildChatMessages(historyRef.current.slice(0, -1), text);

    setCurrentResponse('');
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerInfo.provider,
          model: providerInfo.model,
          messages,
          apiKey: providerInfo.apiKey,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setStatus('error');
        return;
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCurrentResponse(fullText);
      }

      historyRef.current = [...historyRef.current, { role: 'assistant', content: fullText }];
      setHistoryVersion(v => v + 1);
      setCurrentResponse('');
      setStatus('idle');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        setCurrentResponse('');
      } else {
        setStatus('error');
      }
    }
  }

  if (status === 'loading-key') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          loading...
        </span>
      </div>
    );
  }

  if (status === 'no-key') {
    return (
      <div className="h-full flex flex-col gap-2">
        <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          add your API key in settings to use the AI assistant
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="glance-label">ai chat</div>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
        {historyRef.current.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded px-2 py-1 max-w-[85%] ${
              msg.role === 'user' ? 'self-end' : 'self-start'
            }`}
            style={{
              background: msg.role === 'user' ? 'var(--glance-surface)' : 'var(--glance-tile)',
              color: 'var(--glance-fg)',
            }}
          >
            {msg.content}
          </div>
        ))}
        {status === 'streaming' && currentResponse && (
          <div
            className="text-sm rounded px-2 py-1 max-w-[85%] self-start"
            style={{ background: 'var(--glance-tile)', color: 'var(--glance-fg)' }}
          >
            {currentResponse}
          </div>
        )}
        {status === 'error' && (
          <span className="text-sm" style={{ color: 'var(--glance-muted)' }}>
            something went wrong — please try again
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <input
          type="text"
          className="flex-1 text-sm rounded px-2 py-1 border"
          style={{
            background: 'var(--glance-surface)',
            color: 'var(--glance-fg)',
            borderColor: 'var(--glance-border, var(--glance-muted))',
          }}
          placeholder="Ask anything..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          disabled={status === 'streaming'}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(inputText);
            }
          }}
        />
        <button
          className="text-sm rounded px-2 py-1"
          style={{ background: 'var(--glance-accent)', color: 'var(--glance-fg)' }}
          disabled={status === 'streaming' || !inputText.trim()}
          onClick={() => handleSend(inputText)}
        >
          Send
        </button>
        {status === 'streaming' && (
          <button
            className="text-sm rounded px-2 py-1"
            style={{ background: 'var(--glance-muted)', color: 'var(--glance-fg)' }}
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
