import { ArrowRight, Calculator } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSubmit } from 'react-router'

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TaggedCalculateDistance, TaggedFindCities } from './TripActions'

interface DistanceCalculatorProps {
  onDistanceCalculated: (distance?: number) => void
  distance?: number
  citiesSuggestions: City[]
}

interface City {
  id: string
  name: string
}

export const DistanceCalculator = ({
  onDistanceCalculated,
  distance,
  citiesSuggestions
}: DistanceCalculatorProps) => {
  const submit = useSubmit()

  const handleCalculateCityDistance = (from: string, to: string) => {
    submit(
      TaggedCalculateDistance.make({ from, to }),
      {
        // action: '/dashboard',
        method: 'post',
        encType: 'application/json'
      }
    )
  }

  const [fromCityInput, setFromCityInput] = useState<string>('')
  const [toCityInput, setToCityInput] = useState<string>('')
  const [fromCitySelected, setFromCitySelected] = useState<City | null>(null)
  const [toCitySelected, setToCitySelected] = useState<City | null>(null)
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [showFromWarning, setShowFromWarning] = useState(false)
  const [showToWarning, setShowToWarning] = useState(false)

  const fromContainerRef = useRef<HTMLDivElement>(null)
  const toContainerRef = useRef<HTMLDivElement>(null)

  // Gérer la sélection d'une ville
  const handleCitySelect = (type: 'from' | 'to', city: City) => {
    if (type === 'from') {
      setFromCitySelected(city)
      setFromCityInput(city.name)
      setShowFromSuggestions(false)
      setShowFromWarning(false)

      if (toCitySelected) {
        handleCalculateCityDistance(city.id, toCitySelected.id)
        onDistanceCalculated(distance)
      }
    } else {
      setToCitySelected(city)
      setToCityInput(city.name)
      setShowToSuggestions(false)
      setShowToWarning(false)

      if (fromCitySelected) {
        handleCalculateCityDistance(fromCitySelected.id, city.id)
        onDistanceCalculated(distance)
      }
    }
  }

  // Gérer le changement d'input
  const handleInputChange = (type: 'from' | 'to', city: string) => {
    if (type === 'from') {
      setFromCityInput(city)
      setFromCitySelected(null)
      onDistanceCalculated(undefined)

      const isLengthValid = city.length >= 3
      if (isLengthValid) {
        setShowFromSuggestions(isLengthValid)
        submit(
          TaggedFindCities.make({ city }),
          {
            // action: '/dashboard',
            method: 'post',
            encType: 'application/json'
          }
        )
      } else {
        setShowFromSuggestions(false)
      }
    } else {
      setToCityInput(city)
      setToCitySelected(null)
      onDistanceCalculated(undefined)

      const isLengthValid = city.length >= 3
      if (isLengthValid) {
        setShowToSuggestions(isLengthValid)
        submit(
          TaggedFindCities.make({ city }),
          {
            // action: '/dashboard',
            method: 'post',
            encType: 'application/json'
          }
        )
      } else {
        setShowToSuggestions(false)
      }
    }
  }

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromContainerRef.current && !fromContainerRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false)
        // Afficher l'avertissement si du texte est saisi mais aucune ville n'est sélectionnée
        if (fromCityInput.length >= 3 && !fromCitySelected) {
          setShowFromWarning(true)
        }
      }
      if (toContainerRef.current && !toContainerRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false)
        // Afficher l'avertissement si du texte est saisi mais aucune ville n'est sélectionnée
        if (toCityInput.length >= 3 && !toCitySelected) {
          setShowToWarning(true)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [fromCityInput, fromCitySelected, toCityInput, toCitySelected])

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
            onFocus={() => {
              setShowFromWarning(false)
              if (fromCityInput.length >= 3) setShowFromSuggestions(true)
            }}
            placeholder="Saisir au moins 3 caractères..."
            className={`bg-white text-sm lg:text-base min-h-[44px] ${
              showFromWarning ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {showFromWarning && (
            <p className="text-xs text-red-500 mt-1">
              Veuillez sélectionner une ville dans la liste
            </p>
          )}
          {showFromSuggestions && citiesSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {citiesSuggestions.map(city => (
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
          {showFromSuggestions && citiesSuggestions.length === 0 && fromCityInput.length >= 3 && (
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
            onFocus={() => {
              setShowToWarning(false)
              if (toCityInput.length >= 3) setShowToSuggestions(true)
            }}
            placeholder="Saisir au moins 3 caractères..."
            className={`bg-white text-sm lg:text-base min-h-[44px] ${
              showToWarning ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {showToWarning && (
            <p className="text-xs text-red-500 mt-1">
              Veuillez sélectionner une ville dans la liste
            </p>
          )}
          {showToSuggestions && citiesSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {citiesSuggestions.map(city => (
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
          {showToSuggestions && citiesSuggestions.length === 0 && toCityInput.length >= 3 && (
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

      {fromCitySelected && toCitySelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-white rounded-md border border-[#2fd1d1]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#004D55]">Distance calculée :</span>
            <span className="text-lg font-semibold text-[#2fd1d1]">
              {distance} km
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
