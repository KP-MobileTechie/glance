import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from './CommandPalette';

interface PaletteCommand {
  id: string;
  label: string;
  keywords?: string[];
  action: () => void;
  group?: string;
}

function makeCommands(): PaletteCommand[] {
  return [
    { id: 'open-settings', label: 'open settings', group: 'settings', action: vi.fn() },
    { id: 'theme-dark', label: 'switch theme: dark neon dev', keywords: ['dark neon dev', 'theme'], group: 'themes', action: vi.fn() },
    { id: 'widget-clock', label: 'hide widget: clock', keywords: ['clock', 'widget', 'toggle'], group: 'widgets', action: vi.fn() },
    { id: 'search-google', label: 'change search engine: google', keywords: ['google', 'search'], group: 'settings', action: vi.fn() },
  ];
}

function renderPalette(overrides: Partial<{
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
  query: string;
  onQueryChange: (q: string) => void;
  onAddTask: (text: string) => void;
}> = {}) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    commands: makeCommands(),
    query: '',
    onQueryChange: vi.fn(),
    onAddTask: vi.fn(),
    ...overrides,
  };
  return { ...render(<CommandPalette {...defaults} />), ...defaults };
}

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when open prop is false', () => {
    renderPalette({ open: false });
    // When closed, the dialog element should not show its content (not open)
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute('open');
  });

  it('renders the search input when open prop is true', () => {
    renderPalette({ open: true });
    expect(screen.getByPlaceholderText(/search or add task/i)).toBeInTheDocument();
  });

  it('shows all commands when query is empty', () => {
    renderPalette({ open: true, query: '' });
    expect(screen.getByText('open settings')).toBeInTheDocument();
    expect(screen.getByText('switch theme: dark neon dev')).toBeInTheDocument();
    expect(screen.getByText('hide widget: clock')).toBeInTheDocument();
    expect(screen.getByText('change search engine: google')).toBeInTheDocument();
  });

  it('filters to matching commands on partial query — "sett" matches open settings', () => {
    renderPalette({ open: true, query: 'sett' });
    expect(screen.getByText('open settings')).toBeInTheDocument();
    expect(screen.queryByText('switch theme: dark neon dev')).not.toBeInTheDocument();
    expect(screen.queryByText('hide widget: clock')).not.toBeInTheDocument();
  });

  it('shows add-task hint when query matches no existing command', () => {
    renderPalette({ open: true, query: 'deploy production site' });
    expect(screen.getByText(/add.*deploy production site.*to active list/i)).toBeInTheDocument();
  });

  it('Escape key triggers onClose callback', async () => {
    const onClose = vi.fn();
    renderPalette({ open: true, onClose });
    const input = screen.getByPlaceholderText(/search or add task/i);
    input.focus();
    // Simulate native dialog close event (fired by Escape in real browser)
    const dialog = document.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('close', { bubbles: false }));
    expect(onClose).toHaveBeenCalled();
  });

  it('ArrowDown moves highlight to next item', async () => {
    renderPalette({ open: true, query: '' });
    const input = screen.getByPlaceholderText(/search or add task/i);
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    // JSDOM does not support showModal(), so dialog content is hidden;
    // query with hidden:true to access the list items
    const items = screen.getAllByRole('option', { hidden: true });
    expect(items[1]).toHaveClass('selected');
  });

  it('ArrowUp moves highlight to previous item, wraps at top', async () => {
    renderPalette({ open: true, query: '' });
    const input = screen.getByPlaceholderText(/search or add task/i);
    input.focus();
    // ArrowUp from index 0 should wrap to last item
    await userEvent.keyboard('{ArrowUp}');
    const items = screen.getAllByRole('option', { hidden: true });
    expect(items[items.length - 1]).toHaveClass('selected');
  });

  it('Enter on highlighted item calls command action', async () => {
    const commands = makeCommands();
    const actionSpy = vi.fn();
    commands[0] = { ...commands[0], action: actionSpy };
    renderPalette({ open: true, query: '', commands });
    const input = screen.getByPlaceholderText(/search or add task/i);
    input.focus();
    // First item is selected at index 0, press Enter
    await userEvent.keyboard('{Enter}');
    expect(actionSpy).toHaveBeenCalled();
  });

  it('PROD-08: selecting add-task command calls onChange with new todo in active list', async () => {
    const onAddTask = vi.fn();
    renderPalette({ open: true, query: 'deploy site', onAddTask });
    // The add-task hint should be visible (query doesn't match existing commands well)
    const addHint = screen.getByText(/add.*deploy site.*to active list/i);
    expect(addHint).toBeInTheDocument();
    await userEvent.click(addHint);
    expect(onAddTask).toHaveBeenCalledWith('deploy site');
  });

  it('PROD-07: "theme" partial query surfaces switch-theme commands', () => {
    renderPalette({ open: true, query: 'theme' });
    expect(screen.getByText('switch theme: dark neon dev')).toBeInTheDocument();
  });

  it('PROD-07: "settings" query surfaces open-settings command', () => {
    renderPalette({ open: true, query: 'settings' });
    expect(screen.getByText('open settings')).toBeInTheDocument();
  });

  it('PROD-07: "widget" query surfaces toggle-widget commands', () => {
    renderPalette({ open: true, query: 'widget' });
    expect(screen.getByText('hide widget: clock')).toBeInTheDocument();
  });

  it('PROD-07: "search" query surfaces change-search-engine commands', () => {
    renderPalette({ open: true, query: 'search' });
    expect(screen.getByText('change search engine: google')).toBeInTheDocument();
  });

  describe('VISW-07: is-open class toggle via rAF + transitionend close guard', () => {
    // Helper: define showModal on a dialog instance (jsdom doesn't implement it on instances)
    function stubShowModal(dialog: HTMLDialogElement) {
      const spy = vi.fn();
      Object.defineProperty(dialog, 'showModal', {
        value: spy,
        writable: true,
        configurable: true,
      });
      return spy;
    }

    it('calls showModal() when open prop is true', () => {
      const { rerender } = render(
        <CommandPalette
          open={false}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      const dialog = document.querySelector('dialog')!;
      const showModalSpy = stubShowModal(dialog);
      rerender(
        <CommandPalette
          open={true}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      expect(showModalSpy).toHaveBeenCalled();
    });

    it('adds is-open class via requestAnimationFrame when open goes true', async () => {
      vi.useFakeTimers();
      const { rerender } = render(
        <CommandPalette
          open={false}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      const dialog = document.querySelector('dialog')!;
      stubShowModal(dialog);
      rerender(
        <CommandPalette
          open={true}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      // Before rAF flush, is-open should not be present
      expect(dialog.classList.contains('is-open')).toBe(false);
      // Flush rAF
      await act(async () => { vi.runAllTimers(); });
      expect(dialog.classList.contains('is-open')).toBe(true);
      vi.useRealTimers();
    });

    it('removes is-open class when open prop goes false', async () => {
      vi.useFakeTimers();
      const { rerender } = render(
        <CommandPalette
          open={true}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      const dialog = document.querySelector('dialog')!;
      stubShowModal(dialog);
      // Flush rAF so is-open is added
      await act(async () => { vi.runAllTimers(); });
      expect(dialog.classList.contains('is-open')).toBe(true);
      // Now close
      rerender(
        <CommandPalette
          open={false}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      expect(dialog.classList.contains('is-open')).toBe(false);
      vi.useRealTimers();
    });

    it('attaches transitionend listener when open goes false and dialog.open is true', async () => {
      vi.useFakeTimers();
      const { rerender } = render(
        <CommandPalette
          open={true}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      const dialog = document.querySelector('dialog')!;
      stubShowModal(dialog);
      await act(async () => { vi.runAllTimers(); });
      // Simulate dialog.open = true
      Object.defineProperty(dialog, 'open', { value: true, writable: true, configurable: true });
      const addEventSpy = vi.spyOn(dialog, 'addEventListener');
      rerender(
        <CommandPalette
          open={false}
          onClose={vi.fn()}
          commands={makeCommands()}
          query=""
          onQueryChange={vi.fn()}
          onAddTask={vi.fn()}
        />
      );
      const transitionEndCall = addEventSpy.mock.calls.find(
        (call) => call[0] === 'transitionend'
      );
      expect(transitionEndCall).toBeDefined();
      vi.useRealTimers();
    });
  });
});
