export const dynamic = 'force-dynamic';

const VALID_PROVIDERS = ['openai', 'anthropic'] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  provider: string;
  model: string;
  messages: ChatMessage[];
  apiKey: string;
  maxTokens?: number;
}

export async function POST(req: Request): Promise<Response> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { provider, model, messages, apiKey, maxTokens } = body;

  // Validate API key
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'missing-key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // SSRF protection: validate provider against allowlist
  if (!VALID_PROVIDERS.includes(provider as Provider)) {
    return new Response(JSON.stringify({ error: 'invalid-provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const endpoint =
    provider === 'anthropic'
      ? 'https://api.anthropic.com/v1/messages'
      : 'https://api.openai.com/v1/chat/completions';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: maxTokens ?? 2048,
      }),
    });
  } catch {
    return new Response(JSON.stringify({ error: 'upstream-error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: 'upstream-error' }), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Re-stream plain text bytes (strip SSE framing)
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
            try {
              const json = JSON.parse(line.slice(6)) as {
                delta?: { text?: string };
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const text =
                provider === 'anthropic'
                  ? json.delta?.text
                  : json.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
