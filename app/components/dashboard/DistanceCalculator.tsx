import { ArrowRight, Calculator } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { calculateDistance, CITIES, type City } from '~/lib/distanceCalculator'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface DistanceCalculatorProps {
  onDistanceCalculated: (distance: number | null) => void
  initialDistance?: number
}

export const DistanceCalculator = ({
  onDistanceCalculated,
  initialDistance
}: DistanceCalculatorProps) => {
  const [fromCityInput, setFromCityInput] = useState<string>('')
  const [toCityInput, setToCityInput] = useState<string>('')
  const [fromCitySelected, setFromCitySelected] = useState<City | null>(null)
  const [toCitySelected, setToCitySelected] = useState<City | null>(null)
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(
    initialDistance ?? null
  )
  const fromContainerRef = useRef<HTMLDivElement>(null)
  const toContainerRef = useRef<HTMLDivElement>(null)

  // Filtrer les villes en fonction de l'entrée (à partir de 3 caractères)
  const getFilteredCities = (input: string): City[] => {
    if (input.length < 3) return []
    const normalizedInput = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return CITIES.filter(city =>
      city.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedInput)
    )
  }

  // Gérer la sélection d'une ville
  const handleCitySelect = (type: 'from' | 'to', city: City) => {
    if (type === 'from') {
      setFromCitySelected(city)
      setFromCityInput(city.name)
      setShowFromSuggestions(false)
      if (toCitySelected) {
        const distance = calculateDistance(city.id, toCitySelected.id)
        setCalculatedDistance(distance)
        onDistanceCalculated(distance)
      }
    } else {
      setToCitySelected(city)
      setToCityInput(city.name)
      setShowToSuggestions(false)
      if (fromCitySelected) {
        const distance = calculateDistance(fromCitySelected.id, city.id)
        setCalculatedDistance(distance)
        onDistanceCalculated(distance)
      }
    }
  }

  // Gérer le changement d'input
  const handleInputChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFromCityInput(value)
      setFromCitySelected(null)
      setShowFromSuggestions(value.length >= 3)
      if (!value) {
        setCalculatedDistance(null)
        onDistanceCalculated(null)
      }
    } else {
      setToCityInput(value)
      setToCitySelected(null)
      setShowToSuggestions(value.length >= 3)
      if (!value) {
        setCalculatedDistance(null)
        onDistanceCalculated(null)
      }
    }
  }

  const fromCitySuggestions = getFilteredCities(fromCityInput)
  const toCitySuggestions = getFilteredCities(toCityInput)

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromContainerRef.current && !fromContainerRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false)
      }
      if (toContainerRef.current && !toContainerRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-gradient-to-br from-[#2fd1d1]/5 to-[#004D55]/5 border border-[#2fd1d1]/20 rounded-lg p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-[#2fd1d1]" />
        <Label className="text-[#004D55] text-sm lg:text-base font-semibold">
          Calculateur de distance
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-start">
        {/* Ville de départ */}
        <div ref={fromContainerRef} className="relative">
          <Label
            htmlFor="fromCity"
            className="text-[#004D55] text-sm font-body mb-1 block"
          >
            Ville de départ
          </Label>
          <Input
            id="fromCity"
            type="text"
            value={fromCityInput}
            onChange={e => handleInputChange('from', e.target.value)}
            onFocus={() => fromCityInput.length >= 3 && setShowFromSuggestions(true)}
            placeholder="Saisir au moins 3 caractères..."
            className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px]"
          />
          {showFromSuggestions && fromCitySuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {fromCitySuggestions.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect('from', city)}
                  className="w-full text-left px-4 py-2 hover:bg-[#2fd1d1]/10 text-sm lg:text-base transition-colors"
                >
                  {city.name}
                </button>
              ))}
            </motion.div>
          )}
          {showFromSuggestions && fromCitySuggestions.length === 0 && fromCityInput.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
            >
              <p className="text-sm text-gray-500">Aucune ville trouvée</p>
            </motion.div>
          )}
        </div>

        <div className="hidden sm:flex items-center justify-center pt-8">
          <ArrowRight className="h-5 w-5 text-[#2fd1d1]" />
        </div>

        {/* Ville d'arrivée */}
        <div ref={toContainerRef} className="relative">
          <Label
            htmlFor="toCity"
            className="text-[#004D55] text-sm font-body mb-1 block"
          >
            Ville d&apos;arrivée
          </Label>
          <Input
            id="toCity"
            type="text"
            value={toCityInput}
            onChange={e => handleInputChange('to', e.target.value)}
            onFocus={() => toCityInput.length >= 3 && setShowToSuggestions(true)}
            placeholder="Saisir au moins 3 caractères..."
            className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px]"
          />
          {showToSuggestions && toCitySuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {toCitySuggestions.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect('to', city)}
                  className="w-full text-left px-4 py-2 hover:bg-[#2fd1d1]/10 text-sm lg:text-base transition-colors"
                >
                  {city.name}
                </button>
              ))}
            </motion.div>
          )}
          {showToSuggestions && toCitySuggestions.length === 0 && toCityInput.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
            >
              <p className="text-sm text-gray-500">Aucune ville trouvée</p>
            </motion.div>
          )}
        </div>
      </div>

      {calculatedDistance !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-white rounded-md border border-[#2fd1d1]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#004D55]">Distance calculée :</span>
            <span className="text-lg font-semibold text-[#2fd1d1]">
              {calculatedDistance} km
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
