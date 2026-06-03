import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthButton } from './AuthButton';

describe('AuthButton', () => {
  it('renders nothing when auth is disabled', () => {
    const { container } = render(
      <AuthButton enabled={false} user={null} onSignIn={() => {}} onSignOut={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a sign-in control when enabled and signed out', () => {
    render(<AuthButton enabled={true} user={null} onSignIn={() => {}} onSignOut={() => {}} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls onSignOut when signed in', async () => {
    const onSignOut = vi.fn();
    const user = { email: 'a@b.c' } as never;
    render(<AuthButton enabled={true} user={user} onSignIn={() => {}} onSignOut={onSignOut} />);
    screen.getByRole('button', { name: /sign out/i }).click();
    expect(onSignOut).toHaveBeenCalled();
  });

  it('shows "connecting…" and is disabled while isPending is true', () => {
    render(<AuthButton enabled={true} user={null} isPending={true} onSignIn={() => {}} onSignOut={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('connecting…');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});
