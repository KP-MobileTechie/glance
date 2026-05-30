'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/client';
import { listPublicThemes, incrementUseCount, type GalleryTheme } from '@/lib/gallery/gallery';
import { updateState } from '@/lib/store/store';
import { applyTheme } from '@/lib/theme/apply';
import type { Theme } from '@/lib/theme/types';
import { GalleryView } from './GalleryView';

export default function GalleryPage() {
  const [themes, setThemes] = useState<GalleryTheme[]>([]);
  const [ready, setReady] = useState(false);
  const client = getSupabase();

  useEffect(() => {
    if (!client) { setReady(true); return; }
    listPublicThemes(client).then(setThemes).finally(() => setReady(true));
  }, [client]);

  async function apply(theme: Theme, id: string | null) {
    applyTheme(theme);
    await updateState({ themeId: theme.id });
    if (client && id) await incrementUseCount(client, id);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="glance-display text-3xl"><span className="glance-aurora-text">Theme gallery</span></h1>
        <Link href="/" className="glance-nav">back to Glance</Link>
      </div>
      {!client ? (
        <p className="text-sm" style={{ color: 'var(--glance-muted)' }}>
          The gallery needs cloud sync configured. You can still share themes by link from the theme menu.
        </p>
      ) : !ready ? (
        <p className="text-sm" style={{ color: 'var(--glance-muted)' }}>Loading themes...</p>
      ) : (
        <GalleryView themes={themes} onApply={(t) => { const g = themes.find((x) => x.theme.id === t.id); apply(t, g ? g.id : null); }} />
      )}
    </main>
  );
}
