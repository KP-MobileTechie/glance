import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ParticleBackground } from './ParticleBackground';

class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage: null | ((e: MessageEvent) => void) = null;
}

beforeEach(() => {
  vi.stubGlobal('Worker', MockWorker);
  vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(42));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('ParticleBackground', () => {
  it('renders null when disabled', () => {
    const { container } = render(<ParticleBackground enabled={false} />);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('renders canvas element when enabled', () => {
    const { container } = render(<ParticleBackground enabled={true} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });

  it('calls cancelAnimationFrame and worker.terminate on unmount', () => {
    const cancelRaf = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancelRaf);

    const instances: MockWorker[] = [];
    class TrackingWorker extends MockWorker {
      constructor() {
        super();
        instances.push(this);
      }
    }
    vi.stubGlobal('Worker', TrackingWorker);

    const { unmount } = render(<ParticleBackground enabled={true} />);
    act(() => {
      unmount();
    });

    expect(cancelRaf).toHaveBeenCalled();
    expect(instances.length).toBeGreaterThan(0);
    expect(instances[0].terminate).toHaveBeenCalled();
  });
});
