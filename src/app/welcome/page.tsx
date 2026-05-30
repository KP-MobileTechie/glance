import Link from 'next/link';
import { IconLogo } from '@/components/icons/icons';

export default function Marketing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center px-6 py-24 text-center">
      <span className="glance-wordmark glance-reveal glance-reveal-1 text-base">
        <span className="glance-logo"><IconLogo /></span> glance
      </span>

      <h1 className="glance-display glance-reveal glance-reveal-2 mt-10 text-5xl sm:text-7xl">
        <span className="glance-aurora-text">Glance.</span>
        <br />
        The start page you
        <br />
        actually want to open.
      </h1>

      <p className="glance-reveal glance-reveal-3 mx-auto mt-8 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--glance-muted)' }}>
        A fast, private home for every new tab. Your clock, your focus, your links,
        and your weather, arranged in a bento grid you can drag into the shape that
        fits your day. Pick a theme, or build your own and share it.
      </p>

      <div className="glance-reveal glance-reveal-4 mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="glance-btn-primary px-6 py-3 text-base">Open Glance</Link>
        <a href="https://github.com/KP-MobileTechie/glance" target="_blank" rel="noopener noreferrer" className="glance-chip px-6 py-3 text-base">
          Star on GitHub
        </a>
      </div>

      <p className="glance-reveal glance-reveal-4 mt-6 text-sm" style={{ color: 'var(--glance-muted)' }}>
        No account needed. Everything stays in your browser until you decide otherwise.
      </p>

      <div
        className="glance-reveal glance-reveal-4 mt-16 grid w-full max-w-2xl grid-cols-3 grid-rows-2 gap-4"
        style={{ height: '240px' }}
        aria-hidden="true"
      >
        <div className="glance-tile col-span-2 row-span-2 flex flex-col items-center justify-center">
          <div className="glance-clock" style={{ fontSize: '2.6rem' }}>
            09<span className="glance-colon">:</span>41
          </div>
          <p className="glance-greet mt-2">good morning</p>
        </div>
        <div className="glance-tile flex items-center px-4"><span className="glance-label">focus</span></div>
        <div className="glance-tile flex items-center px-4"><span className="glance-label">weather</span></div>
      </div>
    </main>
  );
}
