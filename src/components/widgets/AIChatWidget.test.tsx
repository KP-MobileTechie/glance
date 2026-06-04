import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { AIChatWidget } from './AIChatWidget';

vi.mock('@/lib/store/secrets', () => ({
  getSecret: vi.fn(),
  saveSecret: vi.fn(),
  deleteSecret: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// Helper: create a streaming Response from a string
function makeStreamingResponse(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

// Helper: create a never-resolving fetch (hangs before response arrives)
function makeHangingFetch(): Promise<Response> {
  return new Promise(() => {
    // Never resolves — simulates network hang
  });
}

// T-AIFT-06e: no API key → renders setup state
describe('T-AIFT-06e: no-key setup state', () => {
  it('renders "add your API key in settings" when getSecret returns undefined for all keys', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockResolvedValue(undefined);

    render(<AIChatWidget state={defaultState()} onChange={vi.fn()} />);

    expect(await screen.findByText(/add your api key in settings/i)).toBeInTheDocument();
  });
});

// T-AIFT-04a: renders input and Send button when key exists
describe('T-AIFT-04a: input and Send button with API key', () => {
  it('renders a text input and a Send button when openai key exists', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    render(<AIChatWidget state={defaultState()} onChange={vi.fn()} />);

    expect(await screen.findByPlaceholderText(/ask anything/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});

// T-AIFT-04b: Send calls fetch /api/ai with correct body
describe('T-AIFT-04b: Send button calls POST /api/ai', () => {
  it('clicking Send calls fetch(/api/ai) with provider=openai, messages containing user message, apiKey=sk-test', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue(makeStreamingResponse('Hello there'));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    render(<AIChatWidget state={defaultState()} onChange={vi.fn()} />);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'What is 2+2?');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"provider":"openai"'),
        }),
      );
    });

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.provider).toBe('openai');
    expect(callBody.apiKey).toBe('sk-test');
    expect(callBody.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: 'What is 2+2?' }),
      ]),
    );
  });
});

// T-AIFT-04c: Cancel button appears during streaming and aborts
describe('T-AIFT-04c: Cancel button during streaming', () => {
  it('Cancel button appears during streaming and clicking it returns widget to idle state', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockImplementation((_url: unknown, opts: RequestInit) => {
      // Return a promise that only rejects if aborted
      return new Promise<Response>((_resolve, reject) => {
        const signal = opts?.signal as AbortSignal | undefined;
        if (signal?.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
        // Otherwise hangs forever
      });
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    render(<AIChatWidget state={defaultState()} onChange={vi.fn()} />);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Cancel button should appear while streaming
    const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();

    // Click cancel
    await userEvent.click(cancelBtn);

    // Widget should return to idle — Cancel button gone, Send button re-enabled
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});

// T-AIFT-05a: onChange is never called (history stays local)
describe('T-AIFT-05a: onChange never called', () => {
  it('onChange is never called after a send+response cycle', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue(makeStreamingResponse('Response text'));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const onChange = vi.fn();
    render(<AIChatWidget state={defaultState()} onChange={onChange} />);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Test question');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for streaming to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});

// T-AIFT-05b: after send+response, 2 message bubbles visible
describe('T-AIFT-05b: history accumulates in component state', () => {
  it('after send+response cycle, two message bubbles are rendered (user + assistant)', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue(makeStreamingResponse('Hello there'));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    render(<AIChatWidget state={defaultState()} onChange={vi.fn()} />);

    const input = await screen.findByPlaceholderText(/ask anything/i);
    await userEvent.type(input, 'Hi');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Wait for streaming to finish (Cancel button gone)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    // Should see user message 'Hi' and assistant response 'Hello there'
    expect(await screen.findByText('Hi')).toBeInTheDocument();
    expect(await screen.findByText('Hello there')).toBeInTheDocument();
  });
});
