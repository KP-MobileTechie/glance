import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from './ThemeSwitcher';
import { buildTheme } from '@/lib/theme/derive';

describe('ThemeSwitcher', () => {
  it('lists built-in themes and reports the chosen id', async () => {
    const onSelect = vi.fn();
    render(<ThemeSwitcher activeId="dark-neon-dev" onSelect={onSelect} onImport={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /themes/i }));
    await userEvent.click(screen.getByRole('button', { name: /paper calm/i }));
    expect(onSelect).toHaveBeenCalledWith('paper-calm');
  });
});

describe('ThemeSwitcher custom themes', () => {
  const custom = buildTheme({ id: 'custom-mine', name: 'Mine', bg: '#101010', text: '#fff', muted: '#888', accent: '#0f0', font: 'm', mono: 'm', radius: '12px' });

  it('lists custom themes and a create button', async () => {
    const onCreate = vi.fn();
    render(<ThemeSwitcher activeId="dark-neon-dev" customThemes={[custom]} onSelect={() => {}} onImport={() => {}} onCreate={onCreate} />);
    await userEvent.click(screen.getByRole('button', { name: /themes/i }));
    expect(screen.getByRole('button', { name: /mine/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /create theme/i }));
    expect(onCreate).toHaveBeenCalled();
  });
});
