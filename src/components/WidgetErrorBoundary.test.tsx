import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('test render error');
  }
  return <div>child content</div>;
}

describe('WidgetErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders fallback when a child throws', () => {
    render(
      <WidgetErrorBoundary title="Clock">
        <ThrowingChild shouldThrow={true} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('uses the title prop in the fallback message when provided', () => {
    render(
      <WidgetErrorBoundary title="Weather">
        <ThrowingChild shouldThrow={true} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText(/Weather encountered an error/i)).toBeInTheDocument();
  });

  it('falls back to "Widget" when title prop is omitted', () => {
    render(
      <WidgetErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText(/Widget encountered an error/i)).toBeInTheDocument();
  });

  it('renders children normally when no error is thrown', () => {
    render(
      <WidgetErrorBoundary title="Clock">
        <ThrowingChild shouldThrow={false} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.queryByText(/encountered an error/i)).not.toBeInTheDocument();
  });
});
