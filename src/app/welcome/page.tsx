import Link from 'next/link';
import { IconLogo } from '@/components/icons/icons';

export default function Marketing() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <div className="mb-6 flex items-center justify-center gap-2 text-2xl" style={{ color: 'var(--glance-accent)' }}>
        <IconLogo /> <span className="font-semibold">Glance</span>
      </div>
      <h1 className="text-4xl font-light tracking-tight sm:text-6xl">
        Glance: the start page you actually want to open.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: 'var(--glance-muted)' }}>
        A fast, private home for every new tab. Your clock, your focus, your links,
        your weather. Drag it into the shape that fits your day, then pick a theme
        (or build your own and share it).
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link href="/" className="rounded-xl px-6 py-3 text-base font-medium"
          style={{ background: 'var(--glance-accent)', color: 'var(--glance-bg)' }}>
          Open Glance
        </Link>
        <a href="https://github.com" className="rounded-xl border px-6 py-3 text-base"
          style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }}>
          Star on GitHub
        </a>
      </div>
      <p className="mt-8 text-sm" style={{ color: 'var(--glance-muted)' }}>
        No account needed. Everything stays in your browser until you decide otherwise.
      </p>
    </main>
  );
}
