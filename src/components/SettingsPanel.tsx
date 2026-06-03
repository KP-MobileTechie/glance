'use client';
import { useState } from 'react';
import type { AppState, Settings, WidgetInstance, SearchEngine } from '@/lib/store/types';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';
import { saveSecret } from '@/lib/store/secrets';

export interface SettingsPanelProps {
  open: boolean;
  settings: Settings;
  userName: string;
  weatherCity: string | null;
  githubUsername?: string;
  widgets: WidgetInstance[];
  onClose: () => void;
  onChange: (patch: Partial<AppState>) => void;
}

export function SettingsPanel({ open, settings, userName, weatherCity, githubUsername = '', widgets, onClose, onChange }: SettingsPanelProps) {
  const [patInput, setPatInput] = useState('');

  if (!open) return null;
  function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    onChange({ settings: { ...settings, [key]: value } });
  }
  function toggleWidget(id: string) {
    onChange({ widgets: widgets.map((w) => (w.id === id ? { ...w, hidden: !w.hidden } : w)) });
  }
  return (
    <div className="glance-overlay" onClick={onClose}>
      <aside className="glance-sheet" role="dialog" aria-label="settings" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="glance-label">settings</h2>
          <button className="glance-chip" aria-label="close settings" onClick={onClose}>close</button>
        </div>

        <label className="glance-field-row">your name
          <input className="glance-field" style={{ width: '10rem' }} value={userName} placeholder="name"
            onChange={(e) => onChange({ userName: e.target.value })} />
        </label>

        <label className="glance-field-row">24-hour clock
          <input type="checkbox" className="glance-check" aria-label="24-hour clock"
            checked={settings.clock24h} onChange={(e) => setSetting('clock24h', e.target.checked)} />
        </label>

        <label className="glance-field-row">show seconds
          <input type="checkbox" className="glance-check" aria-label="show seconds"
            checked={settings.showSeconds} onChange={(e) => setSetting('showSeconds', e.target.checked)} />
        </label>

        <label className="glance-field-row">temperature
          <select className="glance-field" aria-label="temperature unit" value={settings.tempUnit}
            onChange={(e) => setSetting('tempUnit', e.target.value as 'C' | 'F')}>
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
          </select>
        </label>

        <label className="glance-field-row">weather city
          <input
            className="glance-field"
            style={{ width: '10rem' }}
            placeholder="auto (geolocation)"
            value={weatherCity ?? ''}
            onChange={(e) => onChange({ weatherCity: e.target.value || null })}
          />
        </label>

        {/* GitHub settings */}
        <span className="glance-label">github</span>
        <input
          type="text"
          className="glance-input"
          placeholder="GitHub username"
          value={githubUsername}
          onChange={(e) => onChange({ githubUsername: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            type="password"
            className="glance-input flex-1"
            placeholder="Personal access token"
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="glance-chip text-xs"
            onClick={async () => { await saveSecret('github_token', patInput); setPatInput(''); }}
            disabled={!patInput}
          >
            save
          </button>
        </div>

        <label className="glance-field-row">search engine
          <select className="glance-field" aria-label="search engine" value={settings.searchEngine}
            onChange={(e) => setSetting('searchEngine', e.target.value as SearchEngine)}>
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
            <option value="brave">Brave</option>
          </select>
        </label>

        <div className="glance-label" style={{ marginTop: '0.5rem' }}>widgets</div>
        {widgets.filter((w) => w.kind in WIDGET_REGISTRY).map((w) => (
          <label key={w.id} className="glance-field-row">{WIDGET_REGISTRY[w.kind].title}
            <input type="checkbox" className="glance-check" aria-label={`show ${WIDGET_REGISTRY[w.kind].title}`}
              checked={!w.hidden} onChange={() => toggleWidget(w.id)} />
          </label>
        ))}
      </aside>
    </div>
  );
}
