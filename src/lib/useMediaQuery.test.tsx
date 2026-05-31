import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from './useMediaQuery';

function stubMatchMedia(matches: boolean) {
  window.matchMedia = (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

describe('useIsMobile', () => {
  beforeEach(() => stubMatchMedia(false));
  it('returns false on a wide viewport', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
  it('returns true when the media query matches', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
