// Client-side distance calculator with mocked data
export interface City {
  id: string
  name: string
}

export const CITIES: City[] = [
  { id: 'paris', name: 'Paris' },
  { id: 'lyon', name: 'Lyon' },
  { id: 'marseille', name: 'Marseille' },
  { id: 'toulouse', name: 'Toulouse' },
  { id: 'nice', name: 'Nice' },
  { id: 'nantes', name: 'Nantes' },
  { id: 'bordeaux', name: 'Bordeaux' },
  { id: 'lille', name: 'Lille' },
  { id: 'strasbourg', name: 'Strasbourg' },
  { id: 'benque', name: 'Benque' }
]

// Distances mockées entre les villes (en km)
const DISTANCES: Record<string, Record<string, number>> = {
  paris: {
    lyon: 465,
    marseille: 775,
    toulouse: 678,
    nice: 930,
    nantes: 385,
    bordeaux: 584,
    lille: 225,
    strasbourg: 490,
    benque: 820
  },
  lyon: {
    paris: 465,
    marseille: 315,
    toulouse: 540,
    nice: 470,
    nantes: 660,
    bordeaux: 560,
    lille: 690,
    strasbourg: 490,
    benque: 425
  },
  marseille: {
    paris: 775,
    lyon: 315,
    toulouse: 405,
    nice: 200,
    nantes: 900,
    bordeaux: 650,
    lille: 1000,
    strasbourg: 780,
    benque: 290
  },
  toulouse: {
    paris: 678,
    lyon: 540,
    marseille: 405,
    nice: 590,
    nantes: 580,
    bordeaux: 245,
    lille: 900,
    strasbourg: 890,
    benque: 175
  },
  nice: {
    paris: 930,
    lyon: 470,
    marseille: 200,
    toulouse: 590,
    nantes: 1100,
    bordeaux: 840,
    lille: 1150,
    strasbourg: 690,
    benque: 450
  },
  nantes: {
    paris: 385,
    lyon: 660,
    marseille: 900,
    toulouse: 580,
    nice: 1100,
    bordeaux: 345,
    lille: 610,
    strasbourg: 880,
    benque: 700
  },
  bordeaux: {
    paris: 584,
    lyon: 560,
    marseille: 650,
    toulouse: 245,
    nice: 840,
    nantes: 345,
    lille: 810,
    strasbourg: 950,
    benque: 230
  },
  lille: {
    paris: 225,
    lyon: 690,
    marseille: 1000,
    toulouse: 900,
    nice: 1150,
    nantes: 610,
    bordeaux: 810,
    strasbourg: 535,
    benque: 1050
  },
  strasbourg: {
    paris: 490,
    lyon: 490,
    marseille: 780,
    toulouse: 890,
    nice: 690,
    nantes: 880,
    bordeaux: 950,
    lille: 535,
    benque: 950
  },
  benque: {
    paris: 820,
    lyon: 425,
    marseille: 290,
    toulouse: 175,
    nice: 450,
    nantes: 700,
    bordeaux: 230,
    lille: 1050,
    strasbourg: 950
  }
}

export function calculateDistance(fromCityId: string, toCityId: string): number | null {
  if (!fromCityId || !toCityId) return null
  if (fromCityId === toCityId) return 0

  const distance = DISTANCES[fromCityId]?.[toCityId]
  return distance ?? null
}
