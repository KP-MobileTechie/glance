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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {themes.map((t) => (
        <div key={t.id} className="rounded-xl border p-4"
          style={{ borderColor: 'var(--glance-border)', background: t.theme.colors.bg }}>
          <div className="text-sm font-medium" style={{ color: t.theme.colors.text }}>{t.name}</div>
          <div className="mt-1 text-xs" style={{ color: t.theme.colors.accent }}>{t.use_count} in use</div>
          <button onClick={() => onApply(t.theme)} className="mt-3 rounded px-3 py-1 text-xs"
            style={{ background: t.theme.colors.accent, color: t.theme.colors.bg }}>
            use this
          </button>
        </div>
      ))}
    </div>
  );
}
