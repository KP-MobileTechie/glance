export interface NewsItem {
  id: string;
  title: string;
  url: string;
}

export async function fetchHNStories(count: number): Promise<NewsItem[]> {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${count}`,
  );
  if (!res.ok) throw new Error('network-error');
  const data = (await res.json()) as {
    hits: Array<{ objectID: string; title: string; url: string | null; story_id: number }>;
  };
  return data.hits.map((h) => ({
    id: h.objectID,
    title: h.title,
    url: h.url ?? `https://news.ycombinator.com/item?id=${h.story_id}`,
  }));
}

export async function fetchRSSFeed(rssUrl: string, count: number): Promise<NewsItem[]> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('network-error');
  const { contents } = (await res.json()) as { contents: string };
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('parse-error');
  return Array.from(doc.querySelectorAll('item'))
    .slice(0, count)
    .map((item) => ({
      id: item.querySelector('guid')?.textContent ?? crypto.randomUUID(),
      title: item.querySelector('title')?.textContent ?? '(no title)',
      url: item.querySelector('link')?.textContent ?? '',
    }));
}
