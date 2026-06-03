import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { SettingsPanel } from './SettingsPanel';

function setup(overrides: Record<string, unknown> = {}) {
  const s = defaultState();
  const onChange = vi.fn();
  render(
    <SettingsPanel open settings={s.settings} userName={s.userName} weatherCity={null} widgets={s.widgets} onClose={() => {}} onChange={onChange} {...overrides} />,
  );
  return { onChange };
}

describe('SettingsPanel', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <SettingsPanel open={false} settings={defaultState().settings} userName="" widgets={defaultState().widgets} onClose={() => {}} onChange={() => {}} />,
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

  it('calls onChange with weatherCity when city input changes', async () => {
    const { onChange } = setup({ weatherCity: null });
    await userEvent.type(screen.getByPlaceholderText(/auto.*geolocation/i), 'Tokyo');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ weatherCity: 'Tokyo' }));
  });
});
