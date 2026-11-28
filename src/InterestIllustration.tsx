import { chakra } from '@chakra-ui/react'
import type { Area } from './courseTrail.ts'

const illustrations = {
  tech: ['M14 14h20v20H14z M19 8v6m10-6v6M19 34v6m10-6v6M8 19h6m-6 10h6m20-10h6m-6 10h6', 'M20 20h8v8h-8z'],
  business: ['M8 37h32M9 28l9-9 7 5 13-13m-8 0h8v8', 'M17 33v-5m8 5v-3m8 3v-9'],
  data: ['M8 10v28h32M13 33V23h6v10m3 0V16h6v17m3 0V11h6v22', 'M13 18v-3m6 3v-6m3-1h6'],
  human: ['M23 18a5 5 0 1 1-10 0 5 5 0 1 1 10 0zM8 35a10 10 0 0 1 20 0', 'M37 18a5 5 0 1 1-10 0 5 5 0 1 1 10 0zM30 25a10 10 0 0 1 10 10'],
  language: ['M10 10h19a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H17l-7 6v-6a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4z', 'M17 31a4 4 0 0 0 4 4h9l7 5v-5a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4M13 17h13'],
  art: ['M10 30 29 11l8 8-19 19-11 3zM26 14l8 8M10 30l8 8', 'M25 38h14M36 6v4m-2-2h4'],
} satisfies Record<Area, readonly [string, string]>

export function InterestIllustration({ area }: { area: Area }) {
  const [outline, accent] = illustrations[area]
  return (
    <chakra.svg
      aria-hidden="true" focusable={false} viewBox="0 0 48 48" boxSize="12" flexShrink="0"
      color="hse.700" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={outline} />
      <chakra.path d={accent} color="gsb.solid" stroke="currentColor" />
    </chakra.svg>
  )
}
