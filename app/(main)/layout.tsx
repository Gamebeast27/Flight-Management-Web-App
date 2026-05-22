import { Navbar } from '@/components/Navbar'
import { BookingProgress } from '@/components/BookingProgress'

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Booking progress stepper — visible on all booking pages */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 py-4 px-4">
        <BookingProgress />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} FlightMgmt · Built with Next.js &amp; Supabase
      </footer>
    </div>
  )
}
