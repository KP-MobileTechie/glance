import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeCreator } from './ThemeCreator';

describe('ThemeCreator', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<ThemeCreator open={false} onClose={() => {}} onSave={() => {}} onApply={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('saves a theme built from the typed accent hex code', async () => {
    const onSave = vi.fn();
    render(<ThemeCreator open onClose={() => {}} onSave={onSave} onApply={() => {}} />);
    const accentHex = screen.getByLabelText(/accent hex/i);
    await userEvent.clear(accentHex);
    await userEvent.type(accentHex, '#ff0000');
    await userEvent.click(screen.getByRole('button', { name: /save to my themes/i }));
    expect(onSave).toHaveBeenCalled();
    const theme = onSave.mock.calls.at(-1)[0];
    expect(theme.colors.accent).toBe('#ff0000');
    expect(theme.colors.accentGlow).toContain('rgba(255, 0, 0');
  });

  it('shows the current hex code for each colour', () => {
    render(<ThemeCreator open onClose={() => {}} onSave={() => {}} onApply={() => {}} />);
    expect((screen.getByLabelText(/accent hex/i) as HTMLInputElement).value).toBe('#5eead4');
    expect((screen.getByLabelText(/background hex/i) as HTMLInputElement).value).toBe('#07080d');
  });

  it('applies a theme when apply is clicked', async () => {
    const onApply = vi.fn();
    render(<ThemeCreator open onClose={() => {}} onSave={() => {}} onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: /^apply$/i }));
    expect(onApply).toHaveBeenCalled();
  });
});
