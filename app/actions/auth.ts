'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthActionState = { error: string } | null

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email    = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Invalid form submission.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email    = formData.get('email')
  const password = formData.get('password')
  const confirm  = formData.get('confirmPassword')

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirm !== 'string'
  ) {
    return { error: 'Invalid form submission.' }
  }

  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=Check+your+email+to+confirm+your+account.')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
