import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('navigates to the engine search url on submit', async () => {
    const onNavigate = vi.fn();
    render(<SearchBar engine="google" onNavigate={onNavigate} />);
    await userEvent.type(screen.getByRole('searchbox'), 'hello world{Enter}');
    expect(onNavigate).toHaveBeenCalledWith('https://www.google.com/search?q=hello%20world');
  });

  it('does not navigate on an empty query', async () => {
    const onNavigate = vi.fn();
    render(<SearchBar engine="google" onNavigate={onNavigate} />);
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('focuses the input when the / key is pressed', async () => {
    render(<SearchBar engine="google" onNavigate={() => {}} />);
    await userEvent.keyboard('/');
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('navigates when the search button is clicked', async () => {
    const onNavigate = vi.fn();
    render(<SearchBar engine="duckduckgo" onNavigate={onNavigate} />);
    await userEvent.type(screen.getByRole('searchbox'), 'cats');
    await userEvent.click(screen.getByRole('button', { name: /submit search/i }));
    expect(onNavigate).toHaveBeenCalledWith('https://duckduckgo.com/?q=cats');
  });
});
