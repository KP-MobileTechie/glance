import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IconClock, IconFocus, IconBookmark, IconWeather, IconPalette, IconLogo } from './icons';

describe('icons', () => {
  it('render as inline svg that inherits currentColor', () => {
    const icons = [IconClock, IconFocus, IconBookmark, IconWeather, IconPalette, IconLogo];
    for (const Icon of icons) {
      const { container, unmount } = render(<Icon />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute('stroke')).toBe('currentColor');
      unmount();
    }
  });
});
