'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STEPS = [
  { label: 'Search',   href: '/' },
  { label: 'Flights',  href: '/flights' },
  { label: 'Seat',     href: '/book/seats' },
  { label: 'Details',  href: '/book/details' },
  { label: 'Confirm',  href: '/book/confirmation' },
] as const

export function BookingProgress() {
  const pathname = usePathname()

  const currentIndex = STEPS.findIndex(
    (s) => s.href !== '/' && pathname.startsWith(s.href)
  )
  const activeIndex = pathname === '/' ? 0 : currentIndex === -1 ? 0 : currentIndex

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex
          const isActive    = i === activeIndex

          return (
            <li key={step.href} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                    isCompleted
                      ? 'bg-sky-500 text-white'
                      : isActive
                      ? 'bg-sky-500/20 border-2 border-sky-500 text-sky-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-500',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={[
                    'mt-1 text-[10px] font-medium whitespace-nowrap hidden sm:block',
                    isActive ? 'text-sky-400' : isCompleted ? 'text-slate-300' : 'text-slate-600',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'h-px w-8 sm:w-16 mx-1 transition-colors',
                    i < activeIndex ? 'bg-sky-500' : 'bg-slate-700',
                  ].join(' ')}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
