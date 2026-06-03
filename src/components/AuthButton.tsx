'use client';
import type { User } from '@supabase/supabase-js';

export interface AuthButtonProps {
  enabled: boolean;
  user: User | null;
  isPending?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthButton({ enabled, user, isPending = false, onSignIn, onSignOut }: AuthButtonProps) {
  if (!enabled) return null;
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        disabled={isPending}
        aria-busy={isPending}
        className="glance-chip"
      >
        {isPending ? 'connecting…' : 'sign in with GitHub'}
      </button>
    );
  }
  return (
    <button onClick={onSignOut} className="glance-chip">
      sign out
    </button>
  );
}
