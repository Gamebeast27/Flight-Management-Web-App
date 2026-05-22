'use client'

import { useActionState } from 'react'
import { signUpAction, type AuthActionState } from '@/app/actions/auth'

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/20 hover:shadow-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      {pending ? 'Creating account…' : 'Create Account'}
    </button>
  )
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
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
          htmlFor="signup-email"
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          Email address
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          Password
          <span className="ml-1 text-slate-500 normal-case">(min. 8 characters)</span>
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-confirm"
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          Confirm password
        </label>
        <input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      <SubmitButton pending={isPending} />
    </form>
  )
}
