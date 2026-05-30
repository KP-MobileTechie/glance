import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StartPage from './StartPage';

beforeEach(() => indexedDB.deleteDatabase('glance'));

describe('StartPage', () => {
  it('loads local state and renders the grid widgets', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByText(/today's focus/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /themes/i })).toBeInTheDocument();
  });
});
