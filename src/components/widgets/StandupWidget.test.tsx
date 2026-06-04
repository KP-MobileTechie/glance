import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { StandupWidget } from './StandupWidget';

// Mock dependencies
vi.mock('@/lib/store/secrets', () => ({
  getSecret: vi.fn(),
  saveSecret: vi.fn(),
  deleteSecret: vi.fn(),
}));

vi.mock('@/lib/github/github', () => ({
  fetchYesterdayCommits: vi.fn().mockResolvedValue([]),
  fetchGitHubStats: vi.fn(),
  fetchContributions: vi.fn(),
  colorToAccentPct: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Helper: build a ReadableStream that emits a single text chunk then closes
function makeStreamResponse(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

describe('StandupWidget (AIFT-06)', () => {
  it('T-AIFT-06c: renders setup message when both API keys are undefined', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockResolvedValue(undefined);

    render(<StandupWidget state={defaultState()} onChange={vi.fn()} />);

    expect(await screen.findByText(/add your api key in settings/i)).toBeInTheDocument();
  });
});

describe('StandupWidget (AIFT-02)', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('T-AIFT-02d: renders "generate standup" button when OpenAI key is present', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    render(<StandupWidget state={defaultState()} onChange={vi.fn()} />);

    expect(await screen.findByRole('button', { name: /generate standup/i })).toBeInTheDocument();
  });

  it('T-AIFT-02e: clicking "generate standup" POSTs to /api/ai with correct body assembled from done todos', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue(makeStreamResponse('Draft standup text'));
    vi.stubGlobal('fetch', fetchMock);

    const state = {
      ...defaultState(),
      todos: [{ id: '1', text: 'fix bug', done: true }],
      todoLists: [{ id: 'default', name: 'tasks', todos: [] }],
    };

    render(<StandupWidget state={state} onChange={vi.fn()} />);

    const btn = await screen.findByRole('button', { name: /generate standup/i });
    await userEvent.click(btn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    // Parse and verify POST body
    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body as string);
    expect(body.provider).toBe('openai');
    expect(Array.isArray(body.messages)).toBe(true);
    expect(body.apiKey).toBe('sk-test');

    // Verify the standup draft appears in the widget
    await waitFor(() => {
      expect(screen.getByText('Draft standup text')).toBeInTheDocument();
    });
  });
});

describe('StandupWidget (AIFT-03)', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('T-AIFT-03a: copy button calls navigator.clipboard.writeText with draft text after generation', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const draftText = 'My standup draft content';
    const fetchMock = vi.fn().mockResolvedValue(makeStreamResponse(draftText));
    vi.stubGlobal('fetch', fetchMock);

    render(<StandupWidget state={defaultState()} onChange={vi.fn()} />);

    const generateBtn = await screen.findByRole('button', { name: /generate standup/i });
    await userEvent.click(generateBtn);

    // Wait for draft to appear and copy button to show
    await waitFor(() => {
      expect(screen.getByText(draftText)).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /copy/i });
    await userEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(draftText);
  });
});

describe('StandupWidget (AIFT-06d — no AppState mutation)', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('T-AIFT-06d: onChange is never called during generate flow', async () => {
    const { getSecret } = await import('@/lib/store/secrets');
    vi.mocked(getSecret).mockImplementation(async (key) => {
      if (key === 'openai_api_key') return 'sk-test';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue(makeStreamResponse('standup result'));
    vi.stubGlobal('fetch', fetchMock);

    const onChange = vi.fn();
    render(<StandupWidget state={defaultState()} onChange={onChange} />);

    const btn = await screen.findByRole('button', { name: /generate standup/i });
    await userEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText('standup result')).toBeInTheDocument();
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
