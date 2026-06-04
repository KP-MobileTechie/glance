// onChange is intentionally unused — DevTools is entirely client-side ephemeral (WDGT-10)
'use client';
import { useState } from 'react';
import type { WidgetProps } from './ClockWidget';

type DevTool = 'json' | 'base64' | 'uuid' | 'regex';

function formatJson(input: string): { ok: true; output: string } | { ok: false; error: string } {
  try { return { ok: true, output: JSON.stringify(JSON.parse(input), null, 2) }; }
  catch (e) { return { ok: false, error: (e as Error).message }; }
}

function b64Encode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function b64Decode(s: string): string {
  try { return decodeURIComponent(escape(atob(s))); }
  catch { return '[invalid base64]'; }
}

function testRegex(pattern: string, flags: string, input: string): string[] {
  try {
    const re = new RegExp(pattern, flags);
    return input.match(re) ?? [];
  } catch { return []; }
}

export function DevToolsWidget({ state: _state, onChange: _onChange }: WidgetProps) {
  const [activeTool, setActiveTool] = useState<DevTool>('json');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [b64Input, setB64Input] = useState('');
  const [b64Output, setB64Output] = useState('');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');
  const [uuid, setUuid] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('');
  const [regexInput, setRegexInput] = useState('');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="glance-label">dev tools</div>
      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap">
        {(['json', 'base64', 'uuid', 'regex'] as DevTool[]).map((tool) => (
          <button
            key={tool}
            type="button"
            className="glance-chip text-xs"
            style={{
              color: activeTool === tool ? 'var(--glance-accent)' : 'var(--glance-muted)',
              borderColor: activeTool === tool
                ? 'color-mix(in oklab, var(--glance-accent) 55%, var(--glance-border))'
                : 'var(--glance-border)',
            }}
            onClick={() => setActiveTool(tool)}
          >
            {tool}
          </button>
        ))}
      </div>

      {/* JSON panel */}
      {activeTool === 'json' && (
        <div className="flex flex-col gap-2 flex-1">
          <textarea
            className="glance-input text-xs font-mono flex-1"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="paste JSON here"
            rows={4}
          />
          <button
            type="button"
            className="glance-chip text-xs"
            aria-label="format JSON"
            onClick={() => {
              const r = formatJson(jsonInput);
              if (r.ok) { setJsonOutput(r.output); setJsonError(''); }
              else { setJsonError(r.error); setJsonOutput(''); }
            }}
          >
            format
          </button>
          {jsonError && (
            <span className="text-xs" style={{ color: 'var(--glance-muted)' }}>{jsonError}</span>
          )}
          {jsonOutput && (
            <pre className="text-xs font-mono overflow-auto flex-1" style={{ color: 'var(--glance-text)' }}>
              {jsonOutput}
            </pre>
          )}
        </div>
      )}

      {/* Base64 panel */}
      {activeTool === 'base64' && (
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-1">
            {(['encode', 'decode'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className="glance-chip text-xs"
                style={{
                  color: b64Mode === mode ? 'var(--glance-accent)' : 'var(--glance-muted)',
                }}
                onClick={() => setB64Mode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <textarea
            className="glance-input text-xs font-mono"
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
            placeholder="text to encode / base64 to decode"
            rows={3}
          />
          <button
            type="button"
            className="glance-chip text-xs"
            aria-label="go"
            onClick={() =>
              setB64Output(b64Mode === 'encode' ? b64Encode(b64Input) : b64Decode(b64Input))
            }
          >
            go
          </button>
          {b64Output && (
            <pre className="text-xs font-mono break-all" style={{ color: 'var(--glance-text)' }}>
              {b64Output}
            </pre>
          )}
        </div>
      )}

      {/* UUID panel */}
      {activeTool === 'uuid' && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="glance-chip text-xs"
            aria-label="generate UUID"
            onClick={() => setUuid(crypto.randomUUID())}
          >
            generate
          </button>
          {uuid && (
            <code
              className="text-xs font-mono select-all"
              style={{ color: 'var(--glance-accent)' }}
            >
              {uuid}
            </code>
          )}
          {uuid && (
            <button
              type="button"
              className="glance-chip text-xs"
              onClick={() => navigator.clipboard.writeText(uuid)}
            >
              copy
            </button>
          )}
        </div>
      )}

      {/* Regex panel */}
      {activeTool === 'regex' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              className="glance-field text-xs font-mono flex-1"
              placeholder="pattern"
              value={regexPattern}
              onChange={(e) => setRegexPattern(e.target.value)}
            />
            <input
              type="text"
              className="glance-field text-xs w-12"
              placeholder="flags"
              value={regexFlags}
              onChange={(e) => setRegexFlags(e.target.value)}
            />
          </div>
          <textarea
            className="glance-input text-xs font-mono"
            placeholder="test string"
            value={regexInput}
            onChange={(e) => setRegexInput(e.target.value)}
            rows={3}
          />
          <button
            type="button"
            className="glance-chip text-xs"
            aria-label="test regex"
            onClick={() => setRegexMatches(testRegex(regexPattern, regexFlags, regexInput))}
          >
            test
          </button>
          <div className="flex flex-wrap gap-1">
            {regexMatches.map((m, i) => (
              <span key={i} className="glance-chip text-xs">{m}</span>
            ))}
            {regexInput && regexMatches.length === 0 && (
              <span style={{ color: 'var(--glance-muted)' }} className="text-xs">no matches</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
