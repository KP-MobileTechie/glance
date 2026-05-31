import { describe, it, expect } from 'vitest';
import { buildSearchUrl } from './search';

describe('buildSearchUrl', () => {
  it('returns null for an empty query', () => {
    expect(buildSearchUrl('   ', 'google')).toBeNull();
  });
  it('builds a google search url for plain text', () => {
    expect(buildSearchUrl('hello world', 'google')).toBe('https://www.google.com/search?q=hello%20world');
  });
  it('uses the chosen engine', () => {
    expect(buildSearchUrl('cats', 'duckduckgo')).toBe('https://duckduckgo.com/?q=cats');
  });
  it('treats a bare domain as a url and adds https', () => {
    expect(buildSearchUrl('github.com', 'google')).toBe('https://github.com');
    expect(buildSearchUrl('vercel.com/docs', 'google')).toBe('https://vercel.com/docs');
  });
  it('keeps an explicit scheme', () => {
    expect(buildSearchUrl('http://example.com', 'google')).toBe('http://example.com');
  });
  it('treats text with spaces as a search even if it has a dot', () => {
    expect(buildSearchUrl('node.js tutorial', 'bing')).toBe('https://www.bing.com/search?q=node.js%20tutorial');
  });
});
