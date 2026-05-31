import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeCreator } from './ThemeCreator';

describe('ThemeCreator', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<ThemeCreator open={false} onClose={() => {}} onSave={() => {}} onApply={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('saves a theme built from the chosen accent colour', async () => {
    const onSave = vi.fn();
    render(<ThemeCreator open onClose={() => {}} onSave={onSave} onApply={() => {}} />);
    const accent = screen.getByLabelText(/accent colour/i) as HTMLInputElement;
    // color inputs: set value property directly + fire native input event
    Object.defineProperty(accent, 'value', { writable: true, configurable: true, value: '#ff0000' });
    accent.dispatchEvent(new Event('input', { bubbles: true }));
    await userEvent.click(screen.getByRole('button', { name: /save to my themes/i }));
    expect(onSave).toHaveBeenCalled();
    const theme = onSave.mock.calls.at(-1)[0];
    expect(theme.colors.accent).toBe('#ff0000');
    expect(theme.colors.accentGlow).toContain('rgba(255, 0, 0');
  });

  it('applies a theme when apply is clicked', async () => {
    const onApply = vi.fn();
    render(<ThemeCreator open onClose={() => {}} onSave={() => {}} onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: /^apply$/i }));
    expect(onApply).toHaveBeenCalled();
  });
});
