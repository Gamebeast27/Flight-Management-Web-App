'use client'

import { signOutAction } from '@/app/actions/auth'
import { resetAll } from '@/store/resetAll'

export function LogoutButton() {
  async function handleLogout() {
    resetAll()           // clears both Zustand stores + localStorage
    await signOutAction() // signs out of Supabase → redirects to /login
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-400 hover:text-red-400 transition-colors duration-200 font-medium"
    >
      Sign out
    </button>
  )
}
