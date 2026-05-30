import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GalleryView } from './GalleryView';
import { getTheme } from '@/lib/theme/themes';

const themes = [
  { id: 'a', name: 'Ocean', theme: getTheme('midnight-ink'), use_count: 12 },
  { id: 'b', name: 'Sand', theme: getTheme('paper-calm'), use_count: 3 },
];

describe('GalleryView', () => {
  it('lists themes with their use counts', () => {
    render(<GalleryView themes={themes} onApply={() => {}} />);
    expect(screen.getByText('Ocean')).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it('calls onApply with the selected theme', () => {
    const onApply = vi.fn();
    render(<GalleryView themes={themes} onApply={onApply} />);
    screen.getAllByRole('button', { name: /use this/i })[0].click();
    expect(onApply).toHaveBeenCalledWith(themes[0].theme);
  });

  it('shows an empty state when there are no themes', () => {
    render(<GalleryView themes={[]} onApply={() => {}} />);
    expect(screen.getByText(/no themes yet/i)).toBeInTheDocument();
  });
});
