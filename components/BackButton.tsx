'use client'

export function BackButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => history.back()}
      className="hover:text-sky-400 transition-colors"
    >
      {label}
    </button>
  )
}
