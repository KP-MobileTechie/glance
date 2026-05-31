'use client';
import type { AppState, Settings, WidgetInstance, SearchEngine } from '@/lib/store/types';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';

export interface SettingsPanelProps {
  open: boolean;
  settings: Settings;
  userName: string;
  widgets: WidgetInstance[];
  onClose: () => void;
  onChange: (patch: Partial<AppState>) => void;
}

export function SettingsPanel({ open, settings, userName, widgets, onClose, onChange }: SettingsPanelProps) {
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
        {widgets.map((w) => (
          <label key={w.id} className="glance-field-row">{WIDGET_REGISTRY[w.kind].title}
            <input type="checkbox" className="glance-check" aria-label={`show ${WIDGET_REGISTRY[w.kind].title}`}
              checked={!w.hidden} onChange={() => toggleWidget(w.id)} />
          </label>
        ))}
      </aside>
    </div>
  );
}
