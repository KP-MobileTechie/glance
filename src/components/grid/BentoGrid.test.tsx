import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { defaultState } from '@/lib/store/types';
import { BentoGrid } from './BentoGrid';

describe('BentoGrid', () => {
  it('renders a tile per visible widget', () => {
    render(<BentoGrid state={defaultState()} onChange={() => {}} onLayoutChange={() => {}} />);
    expect(screen.getByText(/today's focus/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add bookmark/i })).toBeInTheDocument();
  });

  it('does not render hidden widgets', () => {
    const s = defaultState();
    s.widgets = s.widgets.map((w) => (w.kind === 'focus' ? { ...w, hidden: true } : w));
    render(<BentoGrid state={s} onChange={() => {}} onLayoutChange={() => {}} />);
    expect(screen.queryByText(/today's focus/i)).not.toBeInTheDocument();
  });

  it('cycles a widget span when its resize control is clicked', () => {
    const onLayoutChange = vi.fn();
    const s = defaultState();
    render(<BentoGrid state={s} onChange={() => {}} onLayoutChange={onLayoutChange} />);
    screen.getAllByRole('button', { name: /^resize /i })[0].click();
    expect(onLayoutChange).toHaveBeenCalled();
    const next = onLayoutChange.mock.calls[0][0];
    // first widget (clock, 4x3) cycles to the next preset
    expect(next[0].span).not.toEqual(s.widgets[0].span);
  });

  it('renders a single-column stack in mobile mode without resize controls', () => {
    render(<BentoGrid state={defaultState()} onChange={() => {}} onLayoutChange={() => {}} mobile />);
    expect(screen.getByText(/today's focus/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^resize /i })).not.toBeInTheDocument();
  });
});
