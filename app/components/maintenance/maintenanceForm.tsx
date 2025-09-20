import { Loader } from 'components/ui/shadcn-io/ai/loader'
import { pipe } from 'effect'
import * as A from 'effect/Array'
import { Edit3, Plus, Wrench } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Form } from 'react-router'
import { Label } from '~/components/ui/label'
import type { Invoice } from '~/types/Invoice'
import type { Maintenance } from '~/types/Maintenance'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

interface MaintenanceFormProps {
  actionData:
    | {
      maintenanceName: string
      _tag: 'MaintenanceName'
    }
    | {
      message: string
      _tag: 'SimpleTaggedError'
    }
    | {
      readonly _tag: 'MaintenanceId'
      readonly maintenanceId: string
    }
    | undefined

  showForm: boolean
  updateMaintenance?: Maintenance
  isLoading: boolean
  setShowForm: (showForm: boolean) => void
  setMaintenanceUpdate?: (maintenance: Maintenance | undefined) => void
  invoicesWithoutMaintenance: readonly Invoice[]
}

export default function MaintenanceForm(
  {
    actionData,
    showForm,
    updateMaintenance,
    isLoading,
    setShowForm,
    setMaintenanceUpdate,
    invoicesWithoutMaintenance
  }: MaintenanceFormProps
) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [selectedType, setSelectedType] = useState<string | undefined>(updateMaintenance?.type)
  const [isCompleted, setIsCompleted] = useState<boolean>(updateMaintenance?.isCompleted || false)

  const maintenanceTypes = [
    'Vidange',
    'Contrôle Technique',
    'Freins',
    'Pneus',
    'Révision',
    'Filtres',
    'Courroie',
    'Batterie',
    'Climatisation',
    'Autre'
  ]
  const maintenances: readonly Invoice[] = updateMaintenance?.invoice ?
    A.append(invoicesWithoutMaintenance, updateMaintenance.invoice) :
    invoicesWithoutMaintenance

  useEffect(() => {
    setSelectedType(updateMaintenance?.type)
    setIsCompleted(updateMaintenance?.isCompleted || false)
  }, [updateMaintenance])

  useEffect(() => {
    if (actionData?._tag === 'MaintenanceName') {
      setShowForm(false)
      setMaintenanceUpdate?.(undefined)
      setErrorMessage(undefined)
    } else if (actionData?._tag === 'SimpleTaggedError') {
      setErrorMessage(actionData.message)
    }
  }, [actionData, setShowForm, setMaintenanceUpdate])

  const handleClose = () => {
    setShowForm(false)
    setMaintenanceUpdate?.(undefined)
    setErrorMessage(undefined)
    setSelectedType(undefined)
    setIsCompleted(false)
  }

  const isVisible = showForm || updateMaintenance

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Card className="w-full border border-[#E5E7EB] shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#059669] to-[#047857] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 py-2">
                {updateMaintenance ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {updateMaintenance ? "Modifier l'entretien" : 'Nouvel entretien'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}

              <Form method="POST" action="/maintenance" className="space-y-6">
                <input type="hidden" name="_tag" value={updateMaintenance ? 'update' : 'create'} />
                {updateMaintenance && (
                  <input type="hidden" name="id" value={updateMaintenance.id} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-sm font-semibold text-[#004D55]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Type d&apos;entretien *
                    </Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                      name="type"
                      required
                    >
                      <SelectTrigger className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors">
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 flex items-center">
                    <Checkbox
                      id="isCompleted"
                      name="isCompleted"
                      checked={isCompleted}
                      onCheckedChange={checked =>
                        setIsCompleted(checked as boolean)}
                      className="mr-3"
                      value={isCompleted ? 'true' : 'false'}
                    />

                    <Label
                      htmlFor="isCompleted"
                      className="text-sm font-semibold text-[#004D55] cursor-pointer"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Entretien terminé
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dueDate"
                      className="text-sm font-semibold text-[#004D55]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Date prévue
                    </Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      defaultValue={updateMaintenance?.dueDate !== undefined ?
                        new Date(updateMaintenance.dueDate).toISOString().split('T')[0] :
                        undefined}
                      className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dueMileage"
                      className="text-sm font-semibold text-[#004D55]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Kilométrage prévu
                    </Label>
                    <Input
                      id="dueMileage"
                      name="dueMileage"
                      type="number"
                      placeholder="Ex: 120000"
                      defaultValue={updateMaintenance?.dueMileage || undefined}
                      className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors"
                    />
                  </div>
                </div>

                {isCompleted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="completedDate"
                        className="text-sm font-semibold text-[#004D55]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Date de réalisation
                      </Label>
                      <Input
                        id="completedDate"
                        name="completedDate"
                        type="date"
                        defaultValue={updateMaintenance?.completedDate ?
                          new Date(updateMaintenance.completedDate).toISOString().split('T')[0] :
                          undefined}
                        className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="completedMileage"
                        className="text-sm font-semibold text-[#004D55]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Kilométrage à la réalisation
                      </Label>
                      <Input
                        id="completedMileage"
                        name="completedMileage"
                        type="number"
                        placeholder="Ex: 118500"
                        defaultValue={updateMaintenance?.completedMileage || ''}
                        className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-[#004D55]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Notes supplémentaires..."
                    defaultValue={updateMaintenance?.description || ''}
                    className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="invoiceId"
                    className="text-sm font-semibold text-[#004D55]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Facture associée (optionnel)
                  </Label>
                  <Select
                    name="invoiceId"
                    defaultValue={updateMaintenance?.invoice?.id || undefined}
                  >
                    <SelectTrigger className="bg-white border-[#E5E7EB] focus:border-[#004D55] transition-colors">
                      <SelectValue placeholder="Sélectionner une facture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Aucune</SelectItem>
                      {pipe(
                        maintenances,
                        A.map(invoice => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.name} - {new Date(invoice.date).toLocaleDateString('fr-FR')} -
                            {' '}
                            {invoice.amount}€
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !selectedType}
                    className={`flex-1 bg-[#004D55] hover:bg-[#003640] text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {isLoading ?
                      (
                        <>
                          <Loader className="mr-2 h-4 w-4" />
                          {updateMaintenance ? 'Modification...' : 'Création...'}
                        </>
                      ) :
                      (
                        <>
                          <Wrench className="mr-2 h-4 w-4" />
                          {updateMaintenance ? 'Modifier' : 'Créer'}
                        </>
                      )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] min-h-[44px]"
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
