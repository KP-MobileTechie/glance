'use client';
import { useEffect, useRef, useState } from 'react';

export interface PaletteCommand {
  id: string;
  label: string;
  keywords?: string[];
  action: () => void;
  group?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
  query: string;
  onQueryChange: (q: string) => void;
  onAddTask: (text: string) => void;
}

function scoreCommand(label: string, keywords: string[], query: string): number {
  const q = query.toLowerCase();
  const targets = [label.toLowerCase(), ...keywords.map((k) => k.toLowerCase())];
  for (const t of targets) {
    if (t.startsWith(q)) return 2;
    if (t.includes(q)) return 1;
  }
  // character-presence loose match
  for (const t of targets) {
    let idx = 0;
    let match = true;
    for (const ch of q) {
      const pos = t.indexOf(ch, idx);
      if (pos === -1) { match = false; break; }
      idx = pos + 1;
    }
    if (match) return 0.5;
  }
  return 0;
}

export function CommandPalette({
  open,
  onClose,
  commands,
  query,
  onQueryChange,
  onAddTask,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Show/hide native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        try { dialog.showModal(); } catch { /* already open */ }
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Clear query and reset when dialog opens
  useEffect(() => {
    if (open) {
      onQueryChange('');
      setSelectedIdx(0);
    }
    // We intentionally don't add onQueryChange to deps — it's stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Compute filtered commands
  const filteredCommands = query.trim().length > 0
    ? commands
        .map((cmd) => ({ cmd, score: scoreCommand(cmd.label, cmd.keywords ?? [], query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ cmd }) => cmd)
    : commands;

  const showAddHint = query.trim().length > 0 && filteredCommands.length < 3;

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = filteredCommands.length + (showAddHint ? 1 : 0);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx < filteredCommands.length) {
        filteredCommands[selectedIdx].action();
        onClose();
      } else if (showAddHint) {
        onAddTask(query);
        onClose();
      }
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="glance-palette"
      aria-label="command palette"
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="glance-palette-inner">
        <input
          className="glance-input text-base"
          placeholder="search or add task…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoFocus
        />
        <ul className="glance-scroll glance-palette-list" role="listbox">
          {filteredCommands.map((cmd, i) => (
            <li
              key={cmd.id}
              role="option"
              aria-selected={i === selectedIdx}
              className={`glance-palette-item${i === selectedIdx ? ' selected' : ''}`}
              onClick={() => { cmd.action(); onClose(); }}
            >
              {cmd.group && <span className="glance-palette-group">{cmd.group}</span>}
              {cmd.label}
            </li>
          ))}
          {showAddHint && (
            <li
              role="option"
              aria-selected={selectedIdx === filteredCommands.length}
              className={`glance-palette-item${selectedIdx === filteredCommands.length ? ' selected' : ''}`}
              onClick={() => { onAddTask(query); onClose(); }}
            >
              <span className="glance-palette-group">tasks</span>
              Add &ldquo;{query}&rdquo; to active list
            </li>
          )}
        </ul>
      </div>
    </dialog>
  );
}
