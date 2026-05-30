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
      <button onClick={onSignIn} className="glance-chip">
        sign in with GitHub
      </button>
    );
  }
  return (
    <button onClick={onSignOut} className="glance-chip">
      sign out
    </button>
  );
}
