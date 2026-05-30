import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { WIDGET_REGISTRY } from './registry';
import { ClockWidget } from './ClockWidget';
import { FocusWidget } from './FocusWidget';
import { BookmarksWidget } from './BookmarksWidget';

describe('widget registry', () => {
  it('has an entry for every widget kind', () => {
    expect(Object.keys(WIDGET_REGISTRY).sort()).toEqual(
      ['bookmarks', 'clock', 'focus', 'weatherQuote'].sort(),
    );
  });
});

describe('ClockWidget', () => {
  it('greets the user by name when set', () => {
    const state = { ...defaultState(), userName: 'Krunal' };
    render(<ClockWidget state={state} onChange={() => {}} now={new Date('2026-05-30T09:41:00')} />);
    expect(screen.getByText(/krunal/i)).toBeInTheDocument();
  });
});

describe('FocusWidget', () => {
  it('saves the focus text via onChange on blur', async () => {
    const onChange = vi.fn();
    render(<FocusWidget state={defaultState()} onChange={onChange} />);
    const input = screen.getByPlaceholderText(/main focus/i);
    await userEvent.type(input, 'ship the grid');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith({ focus: 'ship the grid' });
  });
});

describe('BookmarksWidget', () => {
  it('adds a bookmark through onChange', async () => {
    const onChange = vi.fn();
    render(<BookmarksWidget state={defaultState()} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.type(screen.getByPlaceholderText(/label/i), 'GitHub');
    await userEvent.type(screen.getByPlaceholderText(/https/i), 'https://github.com');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bookmarks: [expect.objectContaining({ label: 'GitHub', url: 'https://github.com' })],
      }),
    );
  });
});
