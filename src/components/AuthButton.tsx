'use client';
import type { User } from '@supabase/supabase-js';

export interface AuthButtonProps {
  enabled: boolean;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthButton({ enabled, user, onSignIn, onSignOut }: AuthButtonProps) {
  if (!enabled) return null;
  if (!user) {
    return (
      <button onClick={onSignIn} className="rounded-lg border px-3 py-1 text-sm"
        style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-text)' }}>
        sign in with GitHub
      </button>
    );
  }
  return (
    <button onClick={onSignOut} className="rounded-lg border px-3 py-1 text-sm"
      style={{ borderColor: 'var(--glance-border)', color: 'var(--glance-muted)' }}>
      sign out
    </button>
  );
}
