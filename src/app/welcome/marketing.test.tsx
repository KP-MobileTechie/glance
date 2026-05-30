import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Marketing from './page';

describe('Marketing page', () => {
  it('shows the value proposition and primary calls to action', () => {
    render(<Marketing />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/glance/i);
    expect(screen.getByRole('link', { name: /open glance/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  });

  it('uses no em-dashes in copy', () => {
    const { container } = render(<Marketing />);
    expect(container.textContent).not.toContain('—');
  });
});
