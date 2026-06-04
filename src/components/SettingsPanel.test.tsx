import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { SettingsPanel } from './SettingsPanel';

function setup(overrides: Record<string, unknown> = {}) {
  const s = defaultState();
  const onChange = vi.fn();
  render(
    <SettingsPanel open settings={s.settings} userName={s.userName} weatherCity={null} background={s.background} widgets={s.widgets} onClose={() => {}} onChange={onChange} {...overrides} />,
  );
  return { onChange };
}

describe('SettingsPanel', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <SettingsPanel open={false} settings={defaultState().settings} userName="" weatherCity={null} background={defaultState().background} widgets={defaultState().widgets} onClose={() => {}} onChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('toggles the 24-hour clock setting', async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole('checkbox', { name: /24-hour clock/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ settings: expect.objectContaining({ clock24h: false }) }));
  });

  it('hides a widget via its toggle', async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole('checkbox', { name: /show focus/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ widgets: expect.any(Array) }));
    const arg = onChange.mock.calls.at(-1)[0].widgets.find((w: { kind: string }) => w.kind === 'focus');
    expect(arg.hidden).toBe(true);
  });

  it('renders a weather city input with geolocation placeholder', () => {
    setup({ weatherCity: null });
    expect(screen.getByPlaceholderText(/auto.*geolocation/i)).toBeInTheDocument();
  });

  it('calls onChange with weatherCity when city input changes', () => {
    const { onChange } = setup({ weatherCity: null });
    const input = screen.getByPlaceholderText(/auto.*geolocation/i);
    fireEvent.change(input, { target: { value: 'Tokyo' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ weatherCity: 'Tokyo' }));
  });

  it('renders the animated background select with the current value', () => {
    setup({ background: 'aurora' });
    const select = screen.getByRole('combobox', { name: /animated background/i });
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe('aurora');
  });

  it('animated background select has exactly three options: none, aurora wave, particles', () => {
    setup({ background: 'none' });
    const select = screen.getByRole('combobox', { name: /animated background/i });
    const options = Array.from((select as HTMLSelectElement).options);
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).toEqual(['none', 'aurora', 'particles']);
    expect(options.map((o) => o.text)).toEqual(['none', 'aurora wave', 'particles']);
  });

  it('changing animated background select calls onChange with correct BackgroundKind', () => {
    const { onChange } = setup({ background: 'none' });
    const select = screen.getByRole('combobox', { name: /animated background/i });
    fireEvent.change(select, { target: { value: 'particles' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ background: 'particles' }));
  });
});
