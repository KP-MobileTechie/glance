import type { SVGProps } from 'react';

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24" width="1em" height="1em" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...props}
    >
      {children}
    </svg>
  );
}

export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Base>
);

export const IconFocus = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.2" /><path d="M12 1.5V4M12 20v2.5M1.5 12H4M20 12h2.5" /></Base>
);

export const IconBookmark = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M6 4h12v16l-6-4-6 4z" /></Base>
);

export const IconWeather = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><circle cx="9" cy="9" r="3.2" /><path d="M9 1.5V3M3.5 9H2M14.3 3.7l-1 1M4.7 13.3l-1 1M3.7 3.7l1 1" /><path d="M11 18a4 4 0 0 1 .8-7.9A5 5 0 0 1 21 12.5 3.5 3.5 0 0 1 19.5 19H11a3 3 0 0 1 0-6" /></Base>
);

export const IconPalette = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2 0-1.3-1-1.5-1-2.5s.8-1.5 2-1.5h1a5 5 0 0 0 5-5c0-4-4-7-9-7z" /><circle cx="7.5" cy="11" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="16.5" cy="11" r="1" /></Base>
);

export const IconLogo = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.6" /></Base>
);
