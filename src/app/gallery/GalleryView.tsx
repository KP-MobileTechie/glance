'use client';
import type { Theme } from '@/lib/theme/types';
import type { GalleryTheme } from '@/lib/gallery/gallery';

export interface GalleryViewProps {
  themes: GalleryTheme[];
  onApply: (theme: Theme) => void;
}

export function GalleryView({ themes, onApply }: GalleryViewProps) {
  if (themes.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--glance-muted)' }}>No themes yet. Be the first to publish one.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((t) => (
        <div key={t.id} className="glance-tile flex flex-col gap-3 p-4">
          <div
            className="rounded-lg p-3"
            style={{ background: t.theme.colors.bg, border: `1px solid ${t.theme.colors.border}` }}
          >
            <div style={{ color: t.theme.colors.accent, fontFamily: t.theme.mono, fontSize: '1.3rem', fontWeight: 300, letterSpacing: '-0.02em' }}>
              09:41
            </div>
            <div className="mt-2 flex gap-1.5">
              {[t.theme.colors.accent, t.theme.colors.muted, t.theme.colors.text, t.theme.colors.border].map((c, i) => (
                <span key={i} style={{ width: 16, height: 16, borderRadius: 5, background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.12)' }} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--glance-text)' }}>{t.name}</div>
              <div className="text-xs" style={{ color: 'var(--glance-muted)' }}>{t.use_count} in use</div>
            </div>
            <button onClick={() => onApply(t.theme)} className="glance-btn-primary text-xs">use this</button>
          </div>
        </div>
      ))}
    </div>
  );
}
