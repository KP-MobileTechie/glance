import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('lists built-in themes and reports the chosen id', async () => {
    const onSelect = vi.fn();
    render(<ThemeSwitcher activeId="dark-neon-dev" onSelect={onSelect} onImport={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /themes/i }));
    await userEvent.click(screen.getByRole('button', { name: /paper calm/i }));
    expect(onSelect).toHaveBeenCalledWith('paper-calm');
  });
});
