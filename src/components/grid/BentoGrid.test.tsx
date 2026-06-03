import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('reorders widgets correctly when dragging forward', () => {
    const onLayoutChange = vi.fn();
    const s = defaultState();
    // make widget kinds identifiable by their sr-only title text
    const { container } = render(<BentoGrid state={s} onChange={() => {}} onLayoutChange={onLayoutChange} />);
    const tiles = container.querySelectorAll('.glance-tile');
    // drag the first tile (index 0) onto the third tile (index 2)
    // jsdom's synthetic DragEvent has no dataTransfer by default; provide a stub so the handler doesn't throw
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: () => {}, getData: () => '' };
    fireEvent.dragStart(tiles[0], { dataTransfer });
    fireEvent.dragEnter(tiles[2]);
    fireEvent.dragOver(tiles[2]);
    fireEvent.drop(tiles[2]);
    expect(onLayoutChange).toHaveBeenCalled();
    const next = onLayoutChange.mock.calls.at(-1)[0];
    // original order: [clock, focus, bookmarks, weatherQuote]
    // clock (index 0) dropped onto bookmarks (index 2): after splice removes clock,
    // array is [focus, bookmarks, weatherQuote]; insertAt = 2 => [focus, bookmarks, clock, weatherQuote]
    expect(next.map((w: { kind: string }) => w.kind)).toEqual(['focus', 'bookmarks', 'clock', 'weatherQuote']);
  });

  it('reorders widgets correctly when dragging from index 0 to index 3', () => {
    const onLayoutChange = vi.fn();
    const s = defaultState();
    const { container } = render(<BentoGrid state={s} onChange={() => {}} onLayoutChange={onLayoutChange} />);
    const tiles = container.querySelectorAll('.glance-tile');
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: () => {}, getData: () => '' };
    fireEvent.dragStart(tiles[0], { dataTransfer });
    fireEvent.dragEnter(tiles[3]);
    fireEvent.dragOver(tiles[3]);
    fireEvent.drop(tiles[3]);
    expect(onLayoutChange).toHaveBeenCalled();
    const next = onLayoutChange.mock.calls.at(-1)[0];
    // original order: [clock, focus, bookmarks, weatherQuote]
    // clock moves to index 3: [focus, bookmarks, weatherQuote, clock]
    expect(next.map((w: { kind: string }) => w.kind)).toEqual(['focus', 'bookmarks', 'weatherQuote', 'clock']);
  });
});
