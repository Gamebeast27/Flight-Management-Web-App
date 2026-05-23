/** Indian airports in our seed data */
export const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi',   name: 'Indira Gandhi International' },
  { code: 'BOM', city: 'Mumbai',      name: 'Chhatrapati Shivaji Maharaj International' },
  { code: 'BLR', city: 'Bengaluru',  name: 'Kempegowda International' },
  { code: 'HYD', city: 'Hyderabad',  name: 'Rajiv Gandhi International' },
] as const

export type AirportCode = (typeof AIRPORTS)[number]['code']

export const CABIN_CLASSES = [
  { value: 'economy',  label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: 'First Class' },
] as const

/** Seat extra fees matching the seed data */
export const CLASS_EXTRA_FEE: Record<string, number> = {
  economy:  0,
  business: 3000,
  first:    8000,
}

/** All routes available — both directions for each city pair */
export const AVAILABLE_ROUTES: Array<{ origin: AirportCode; destination: AirportCode }> = [
  { origin: 'DEL', destination: 'BOM' },
  { origin: 'BOM', destination: 'DEL' },
  { origin: 'BOM', destination: 'BLR' },
  { origin: 'BLR', destination: 'BOM' },
  { origin: 'DEL', destination: 'BLR' },
  { origin: 'BLR', destination: 'DEL' },
  { origin: 'BOM', destination: 'HYD' },
  { origin: 'HYD', destination: 'BOM' },
  { origin: 'DEL', destination: 'HYD' },
  { origin: 'HYD', destination: 'DEL' },
  { origin: 'BLR', destination: 'HYD' },
  { origin: 'HYD', destination: 'BLR' },
]
