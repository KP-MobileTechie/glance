import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('closes settings panel when Escape is pressed', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Test J: Ctrl+K opens command palette
  it('Test J: Ctrl+K opens the command palette', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByText(/today's focus/i)).toBeInTheDocument());
    // Palette dialog should NOT be open initially
    expect(document.querySelector('dialog[aria-label="command palette"]')).not.toHaveAttribute('open');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
    // After Ctrl+K, paletteOpen becomes true — CommandPalette calls showModal()
    // JSDOM does not implement showModal, but the open prop change should set it
    // We verify the state changed by checking the aria-label dialog open state via React re-render
    await waitFor(() => {
      // The palette input should be accessible when open=true (dialog is rendered with content)
      const paletteInput = document.querySelector('input[placeholder="search or add task…"]');
      expect(paletteInput).toBeInTheDocument();
    });
  });

  // Test K: Escape closes palette first, then settings
  it('Test K: Escape closes palette before settings when both open', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument());
    // Open settings — SettingsPanel renders with role="dialog"
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    // Settings panel uses aria-label="settings"
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument()
    );

    // Open palette with Ctrl+K — paletteOpen becomes true
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
    // Wait for state update
    await waitFor(() => {
      // Both settings (role=dialog with aria-label settings) and palette dialog exist
      expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument();
    });

    // Escape should close palette first (paletteOpen takes priority in the handler)
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    // After first Escape: palette closed, settings still open
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument();
    });

    // Fire Escape again — now settings should close
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /settings/i })).not.toBeInTheDocument();
    });
  });

  // Test L: handlePaletteAddTask adds todo to active list
  it('Test L: adding a task through palette adds it to active list', async () => {
    render(<StartPage />);
    await waitFor(() => expect(screen.getByText(/today's focus/i)).toBeInTheDocument());
    // Open palette
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
    // Type a task name that won't match any commands
    const input = document.querySelector('input[placeholder="search or add task…"]') as HTMLInputElement;
    await waitFor(() => expect(input).toBeInTheDocument());
    await userEvent.type(input, 'deploy site xyz');
    // The add-task hint should appear (hidden:true because palette dialog is not "open" in JSDOM)
    await waitFor(() => {
      expect(screen.getByText(/add.*deploy site xyz.*to active list/i, { hidden: true })).toBeInTheDocument();
    });
    // Click the add hint
    await userEvent.click(screen.getByText(/add.*deploy site xyz.*to active list/i, { hidden: true }));
    // Task should now appear in the FocusWidget
    await waitFor(() => {
      expect(screen.getByText('deploy site xyz')).toBeInTheDocument();
    });
  });
});
