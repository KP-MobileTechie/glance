import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultState } from '@/lib/store/types';
import { SettingsPanel } from './SettingsPanel';

vi.mock('@/lib/store/secrets', () => ({
  saveSecret: vi.fn().mockResolvedValue(undefined),
  deleteSecret: vi.fn().mockResolvedValue(undefined),
  getSecret: vi.fn().mockResolvedValue(undefined),
}));

import * as secrets from '@/lib/store/secrets';

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

  // T-AIFT-01a: OpenAI key input renders
  it('T-AIFT-01a: renders an input with placeholder matching /openai api key/i', () => {
    setup();
    expect(screen.getByPlaceholderText(/openai api key/i)).toBeInTheDocument();
  });

  // T-AIFT-01b: Anthropic key input renders
  it('T-AIFT-01b: renders an input with placeholder matching /anthropic api key/i', () => {
    setup();
    expect(screen.getByPlaceholderText(/anthropic api key/i)).toBeInTheDocument();
  });

  // T-AIFT-01c: OpenAI save calls saveSecret and clears input
  it('T-AIFT-01c: typing into OpenAI input and clicking save calls saveSecret with openai_api_key', async () => {
    const saveSecretMock = vi.mocked(secrets.saveSecret);
    saveSecretMock.mockClear();
    setup();
    const input = screen.getByPlaceholderText(/openai api key/i);
    await userEvent.type(input, 'sk-test-key');
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    // OpenAI save button is the first save button in the AI section (after GitHub PAT save)
    const openaiSaveButton = saveButtons.find((btn) => {
      const parent = btn.closest('.flex');
      return parent?.querySelector('input[placeholder*="OpenAI"]') !== null;
    });
    expect(openaiSaveButton).toBeTruthy();
    await userEvent.click(openaiSaveButton!);
    expect(saveSecretMock).toHaveBeenCalledWith('openai_api_key', 'sk-test-key');
    expect((input as HTMLInputElement).value).toBe('');
  });

  // T-AIFT-01d: OpenAI clear calls deleteSecret
  it('T-AIFT-01d: clicking clear next to OpenAI input calls deleteSecret with openai_api_key', async () => {
    const deleteSecretMock = vi.mocked(secrets.deleteSecret);
    deleteSecretMock.mockClear();
    setup();
    const clearButtons = screen.getAllByRole('button', { name: /^clear$/i });
    const openaiClearButton = clearButtons.find((btn) => {
      const parent = btn.closest('.flex');
      return parent?.querySelector('input[placeholder*="OpenAI"]') !== null;
    });
    expect(openaiClearButton).toBeTruthy();
    await userEvent.click(openaiClearButton!);
    expect(deleteSecretMock).toHaveBeenCalledWith('openai_api_key');
  });

  // T-AIFT-01e: OpenAI save button disabled when input empty
  it('T-AIFT-01e: OpenAI save button is disabled when input is empty', () => {
    setup();
    const openaiSaveButton = screen.getAllByRole('button', { name: /^save$/i }).find((btn) => {
      const parent = btn.closest('.flex');
      return parent?.querySelector('input[placeholder*="OpenAI"]') !== null;
    });
    expect(openaiSaveButton).toBeTruthy();
    expect(openaiSaveButton).toBeDisabled();
  });

  // T-AIFT-01f: Anthropic save calls saveSecret
  it('T-AIFT-01f: typing into Anthropic input and clicking save calls saveSecret with anthropic_api_key', async () => {
    const saveSecretMock = vi.mocked(secrets.saveSecret);
    saveSecretMock.mockClear();
    setup();
    const input = screen.getByPlaceholderText(/anthropic api key/i);
    await userEvent.type(input, 'sk-ant-test-key');
    const anthropicSaveButton = screen.getAllByRole('button', { name: /^save$/i }).find((btn) => {
      const parent = btn.closest('.flex');
      return parent?.querySelector('input[placeholder*="Anthropic"]') !== null;
    });
    expect(anthropicSaveButton).toBeTruthy();
    await userEvent.click(anthropicSaveButton!);
    expect(saveSecretMock).toHaveBeenCalledWith('anthropic_api_key', 'sk-ant-test-key');
  });
});
