import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './_components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | FlightMgmt',
  description: 'Sign in to your FlightMgmt account to manage your bookings.',
}

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to manage your flights &amp; bookings
        </p>
      </div>

      <LoginForm message={message} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </>
  )
}
