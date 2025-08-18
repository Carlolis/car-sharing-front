import { ParseResult, pipe, Schema as Sc } from 'effect'
import * as E from 'effect/Either'
import { MapPin } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, useState } from 'react'
import { Form, useSubmit } from 'react-router'
import type { TripUpdate } from '~/types/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { TaggedCreateTrip } from './DashboardArguments'
interface NewTripFormProps {
  showForm: boolean
  setShowForm: (showForm: boolean) => void
  updateTrip?: TripUpdate
  setTripUpdate: (tripUpdate: TripUpdate | undefined) => void
}

export const NewTripForm = (
  { showForm, updateTrip, setShowForm, setTripUpdate }: NewTripFormProps
) => {
  {/* Formulaire */}
  const submit = useSubmit()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const personnes = [
    { id: 'maé' as const, name: 'Maé' },
    { id: 'charles' as const, name: 'Charles' },
    { id: 'brigitte' as const, name: 'Brigitte' }
  ]

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    pipe(
      new FormData(event.currentTarget).entries(),
      Object.fromEntries,
      trip =>
        Sc.decodeEither(
          pipe(
            TaggedCreateTrip,
            Sc.filter(
              trip => {
                if (trip.tripCreate.drivers.length === 0) {
                  return 'Veuillez sélectionner au moins un conducteur.'
                }
                if (new Date(trip.tripCreate.startDate) > new Date(trip.tripCreate.endDate)) {
                  return 'La date de début ne peut pas être après la date de fin.'
                }
                if (trip.tripCreate.distance < 0) {
                  return 'La distance ne peut pas être négative.'
                }
                return true
              }
            )
          )
        )({
          _tag: 'create',
          tripCreate: {
            ...trip,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            drivers: trip?.drivers == undefined ? [] : trip.drivers
          }
        }),
      E.mapBoth({
        onLeft: error =>
          pipe(
            error,
            ParseResult.ArrayFormatter.formatErrorSync,
            e => setErrorMessage(e[0].message)
          ),
        onRight: trip =>
          pipe(trip, Sc.encodeSync(TaggedCreateTrip), tripCreate => {
            setShowForm(false)
            setErrorMessage(undefined)
            setTripUpdate(undefined)
            submit(tripCreate, {
              action: '/dashboard',
              method: 'post',
              encType: 'application/json'
            })
          })
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
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle
                className="text-lg lg:text-xl text-slate-900 flex items-center gap-2"
                style={{ fontFamily: 'Lato, sans-serif' }}
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
            <CardContent className="p-4 lg:p-6">
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
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label
                      htmlFor="dateDebut"
                      className="text-slate-800 text-sm lg:text-base"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      Date de début <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="startDate"
                      type="date"
                      defaultValue={(() => {
                        const d = updateTrip?.startDate ? updateTrip.startDate : new Date()
                        // d.setDate(d.getDate() + 1)
                        return d.toISOString().split('T')[0]
                      })()}
                      className="bg-white/80 border-slate-300/60 focus:border-[#2fd1d1] focus:ring-[#2fd1d1]/20 text-sm lg:text-base min-h-[44px]"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="dateFin"
                      className="text-slate-800 text-sm lg:text-base"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      Date de fin <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="endDate"
                      type="date"
                      defaultValue={updateTrip?.endDate ?
                        updateTrip.endDate.toISOString().split('T')[0] :
                        undefined}
                      className="bg-white/80 border-slate-300/60 focus:border-[#2fd1d1] focus:ring-[#2fd1d1]/20 text-sm lg:text-base min-h-[44px]"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label
                      htmlFor="distance"
                      className="text-slate-800 text-sm lg:text-base"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      Distance (km) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="distance"
                      type="number"
                      step="0.1"
                      defaultValue={updateTrip?.distance}
                      className="bg-white/80 border-slate-300/60 focus:border-[#2fd1d1] focus:ring-[#2fd1d1]/20 text-sm lg:text-base min-h-[44px]"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      className="text-slate-800 text-sm lg:text-base"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      Personnes <span className="text-red-500">*</span>
                    </Label>
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
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Label
                    htmlFor="destination"
                    className="text-slate-800 text-sm lg:text-base"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    Titre
                  </Label>
                  <Input
                    name="name"
                    defaultValue={updateTrip?.name}
                    placeholder="Ex: Bureau, Supermarché, École..."
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
                    className="text-slate-800 text-sm lg:text-base"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    Commentaires (optionnel)
                  </Label>
                  <Textarea
                    id="commentaires"
                    defaultValue={updateTrip?.comments}
                    name="comments"
                    rows={4}
                    placeholder="Informations supplémentaires sur le trajet..."
                    className="bg-white/80 border-slate-300/60 focus:border-[#00D4AA] focus:ring-[#00D4AA]/20 text-sm lg:text-base min-h-[44px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#00D4AA] to-[#10E68A] hover:from-[#00A8CC] hover:to-[#00D4AA] shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    {updateTrip ? 'Modifier' : 'Enregistrer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setTripUpdate(undefined)
                    }}
                    className="border-slate-300/60 hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    Annuler
                  </Button>
                </motion.div>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
