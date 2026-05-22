'use client'

import { useActionState } from 'react'
import { signInAction, type AuthActionState } from '@/app/actions/auth'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/20 hover:shadow-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  )
}

export function LoginForm({ message }: { message?: string }) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signInAction,
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {/* Email confirmation message (after signup) */}
      {message && (
        <div
          role="status"
          className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-4 py-3 text-sm text-sky-300"
        >
          {message}
        </div>
      )}

      {/* Error */}
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
        >
          {state.error}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-email"
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-password"
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      <SubmitButton pending={isPending} />
    </form>
  )
}
