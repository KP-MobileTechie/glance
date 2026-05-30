import { describe, it, expect } from 'vitest';
import { QUOTES, quoteOfDay } from './quotes';

describe('quoteOfDay', () => {
  it('is deterministic for the same date', () => {
    const a = quoteOfDay(new Date('2026-05-30T00:00:00Z'));
    const b = quoteOfDay(new Date('2026-05-30T23:59:00Z'));
    expect(a.text).toBe(b.text);
  });

  it('changes from one day to the next', () => {
    const a = quoteOfDay(new Date('2026-05-30T12:00:00Z'));
    const b = quoteOfDay(new Date('2026-05-31T12:00:00Z'));
    expect(a.text).not.toBe(b.text);
  });

  it('ships a non-trivial quote list', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(10);
  });
});
