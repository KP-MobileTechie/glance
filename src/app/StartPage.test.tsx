import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StartPage from './StartPage';

beforeEach(() => indexedDB.deleteDatabase('glance'));

describe('StartPage', () => {
  it('loads local state and renders the grid, search, and controls', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByText(/today's focus/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /themes/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });
});
