import { ParseResult, pipe, Schema as Sc } from 'effect'
import * as E from 'effect/Either'
import { MapPin, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, useState } from 'react'
import { Form, useSubmit } from 'react-router'
import type { TripUpdate } from '~/types/api'
import { TripCreate } from '~/types/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { DistanceCalculator } from './DistanceCalculator'
import {
  TaggedCreateTrip,
  TaggedUpdateTrip,
  TripActions
} from './TripActions'
interface NewTripFormProps {
  showForm: boolean
  setShowForm: (showForm: boolean) => void
  updateTrip?: TripUpdate
  setTripUpdate: (tripUpdate: TripUpdate | undefined) => void
  startDate?: Date
}

const ValidatedTripCreate = pipe(
  TripCreate,
  Sc.filter(trip => {
    if (trip.drivers.length === 0) {
      return 'Veuillez sélectionner au moins un conducteur.'
    }
    if (new Date(trip.startDate) > new Date(trip.endDate)) {
      return 'La date de début ne peut pas être après la date de fin.'
    }
    if (trip.distance !== undefined && trip.distance < 0) {
      return 'La distance ne peut pas être négative.'
    }

    return true
  })
)

export const NewTripForm = (
  { showForm, updateTrip, setShowForm, setTripUpdate, startDate }: NewTripFormProps
) => {
  {
    /* Formulaire */
  }
  const submit = useSubmit()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)

  const personnes = [
    { id: 'maé' as const, name: 'Maé' },
    { id: 'charles' as const, name: 'Charles' },
    { id: 'brigitte' as const, name: 'Brigitte' }
  ]

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const entries = Object.fromEntries(formData.entries())
    const tripData = {
      ...entries,
      drivers: formData.getAll('drivers'),
      // Convertir les chaînes vides en undefined pour les champs optionnels
      distance: entries.distance === '' ? undefined : entries.distance
    }

    pipe(
      Sc.decodeUnknownEither(ValidatedTripCreate)(tripData),
      E.mapBoth({
        onLeft: error => {
          const message = pipe(
            error,
            ParseResult.ArrayFormatter.formatErrorSync,
            e => e[0].message
          )
          setErrorMessage(message)
        },
        onRight: trip => {
          setShowForm(false)
          setErrorMessage(undefined)
          setTripUpdate(undefined)

          const submissionData = updateTrip ?
            TaggedUpdateTrip.make({
              tripUpdate: { ...trip, id: updateTrip.id }
            }) :
            TaggedCreateTrip.make({
              tripCreate: { ...trip }
            })

          submit(Sc.encodeUnknownSync(TripActions)(submissionData), {
            // action: '/dashboard',
            method: 'post',
            encType: 'application/json'
          })
        }
      })
    )
  }

  return (
    <AnimatePresence>
      {(showForm || updateTrip) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle
                className="text-lg lg:text-xl text-[#004D55] flex items-center gap-2 font-heading py-2"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <MapPin className="h-5 w-5 text-[#2fd1d1]" />
                </motion.div>
                <span className="text-base lg:text-xl">
                  {updateTrip ? 'Modifier le trajet' : 'Enregistrer un nouveau trajet'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form
                action="/dashboard"
                method="post"
                className="space-y-6"
                onSubmit={handleFormSubmit}
              >
                {errorMessage && (
                  <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="dateDebut"
                      className="text-[#004D55] text-sm lg:text-base font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Date de début <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="startDate"
                      type="date"
                      defaultValue={(() => {
                        const d = updateTrip?.startDate ?
                          updateTrip.startDate :
                          startDate ?
                          startDate :
                          new Date()
                        // d.setDate(d.getDate() + 1)
                        return d.toISOString().split('T')[0]
                      })()}
                      className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="dateFin"
                      className="text-[#004D55] text-sm lg:text-base font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Date de fin <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="endDate"
                      type="date"
                      defaultValue={updateTrip?.endDate ?
                        updateTrip.endDate.toISOString().split('T')[0] :
                        undefined}
                      className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="personne"
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Conducteurs <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/80 border border-slate-300/60 rounded-md p-3 space-y-3 min-h-[44px] flex flex-col justify-center">
                      {personnes.map((membre, index) => (
                        <motion.div
                          key={membre.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center space-x-3 min-h-[32px]"
                        >
                          <Checkbox
                            name="drivers"
                            value={membre.id}
                            defaultChecked={updateTrip?.drivers.includes(membre.id)}
                            className="min-w-[20px] min-h-[20px] data-[state=checked]:bg-[#2fd1d1] data-[state=checked]:border-[#2fd1d1] cursor-pointer"
                          />

                          <Label
                            className="flex items-center gap-2 cursor-pointer text-sm lg:text-base hover:text-slate-900 transition-colors"
                            htmlFor={membre.id}
                          >
                            {membre.name}
                          </Label>
                          <Users className="h-4 w-4 text-[#004D55]" />
                        </motion.div>
                      ))}
                    </div>

                    <div>
                      <Label
                        htmlFor="distance"
                        className="text-[#004D55] text-sm lg:text-base font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Distance (km) <span className="text-gray-600">(optionnel)</span>
                      </Label>
                      <Input
                        name="distance"
                        type="number"
                        step="0.1"
                        value={calculatedDistance !== null ?
                          calculatedDistance :
                          updateTrip?.distance ?? ''}
                        onChange={e => {
                          // Permettre la saisie manuelle, ce qui réinitialise le calcul automatique
                          const value = e.target.value
                          if (value === '') {
                            setCalculatedDistance(null)
                          } else {
                            setCalculatedDistance(parseFloat(value))
                          }
                        }}
                        className="bg-white/80 border-slate-300/60 focus:border-[#2fd1d1] focus:ring-[#2fd1d1]/20 text-sm lg:text-base min-h-[44px] "
                        style={{ fontFamily: 'Lato, sans-serif' }}
                      />

                      {/* Section de calcul de distance */}
                      <DistanceCalculator
                        onDistanceCalculated={setCalculatedDistance}
                        initialDistance={updateTrip?.distance}
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Label
                    htmlFor="destination"
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Destination <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="name"
                    defaultValue={updateTrip?.name}
                    required
                    placeholder="Ex: Benque, Supermarché, École..."
                    className="bg-white/80 border-slate-300/60 focus:border-[#2fd1d1] focus:ring-[#2fd1d1]/20 text-sm lg:text-base min-h-[44px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Label
                    htmlFor="commentaires"
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Commentaires <span className="text-gray-600">(optionnel)</span>
                  </Label>

                  <Textarea
                    id="comments"
                    defaultValue={updateTrip?.comments}
                    name="comments"
                    rows={4}
                    placeholder="Informations supplémentaires sur le trajet..."
                    className="bg-white/80 border-slate-300/60 focus:border-[#00D4AA] focus:ring-[#00D4AA]/20 text-sm lg:text-base min-h-[44px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  />
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    className="order-1 sm:order-2 flex-1 bg-[#004D55] hover:bg-[#003640] text-[#f6f6f6] text-sm lg:text-base py-2 lg:py-3 min-h-[44px] font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {updateTrip ? 'Modifier le trajet' : 'Enregistrer le trajet'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false)
                      setTripUpdate(undefined)
                    }}
                    className="order-2 sm:order-1 border-gray-300 text-[#004D55] hover:bg-gray-50 text-sm lg:text-base py-2 lg:py-3 min-h-[44px] font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Annuler
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
