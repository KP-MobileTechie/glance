'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { getUser, signInWithGitHub, signOut } from './auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const client = getSupabase();

  useEffect(() => {
    if (!client) return;
    getUser(client).then(setUser);
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  return {
    user,
    enabled: Boolean(client),
    signIn: () => signInWithGitHub(client),
    signOut: () => signOut(client),
  };
}
