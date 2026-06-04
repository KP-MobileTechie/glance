import { render, screen } from '@testing-library/react';
import { AuroraBackground } from './AuroraBackground';

describe('AuroraBackground', () => {
  it('renders null when disabled', () => {
    const { container } = render(<AuroraBackground enabled={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders .glance-aurora-bg element when enabled', () => {
    const { container } = render(<AuroraBackground enabled={true} />);
    const el = container.querySelector('.glance-aurora-bg');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('attaches visibilitychange listener on mount when enabled', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    render(<AuroraBackground enabled={true} />);
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    addSpy.mockRestore();
  });

  it('removes visibilitychange listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<AuroraBackground enabled={true} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    removeSpy.mockRestore();
  });
});
