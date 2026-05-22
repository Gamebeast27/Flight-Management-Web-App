import type { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from './_components/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account | FlightMgmt',
  description: 'Create a FlightMgmt account to search and book flights instantly.',
}

export default function SignupPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Book flights in seconds — free, no hidden fees
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
