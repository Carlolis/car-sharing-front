import { identity, Match } from 'effect'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Form, Link } from 'react-router'
import { Label } from '~/components/ui/label'
import type { InvoiceKind } from '~/types/Invoice'

import { Loader } from 'components/ui/shadcn-io/ai/loader'
import { Download, Edit3, Plus, Receipt, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

import type { InvoiceUpdate } from '~/types/InvoiceUpdate'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface InvoiceFormProps {
  actionData:
    | {
      invoiceName: string
      _tag: 'InvoiceName'
    }
    | {
      message: string
      _tag: 'SimpleTaggedError'
    }
    | {
      readonly _tag: 'InvoiceId'
      readonly invoiceId: string
    }
    | undefined

  showForm: boolean
  updateInvoice?: InvoiceUpdate
  isLoading: boolean
  setShowForm: (showForm: boolean) => void
  setInvoiceUpdate?: (invoice: InvoiceUpdate | undefined) => void
}

export default function InvoiceForm(
  { actionData, showForm, updateInvoice, isLoading, setShowForm, setInvoiceUpdate }:
    InvoiceFormProps
) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [selectedKind, setSelectedKind] = useState<InvoiceKind | undefined>(updateInvoice?.kind)
  const [selectedDriver, setSelectedDriver] = useState<string | undefined>(updateInvoice?.driver)
  const [selectedToDriver, setSelectedToDriver] = useState<string | undefined>(
    updateInvoice?.toDriver
  )

  const facturesKinds: InvoiceKind[] = [
    'Carburant',
    'Entretien',
    'Assurance',
    'Réparation',
    'Contrôle technique',
    'Autre',
    'Remboursement'
  ]

  useEffect(() => {
    setSelectedKind(updateInvoice?.kind)
    setSelectedDriver(updateInvoice?.driver)
    setSelectedToDriver(updateInvoice?.toDriver)
  }, [updateInvoice?.kind, updateInvoice?.driver, updateInvoice?.toDriver])
  useEffect(() => {
    const match = Match.type<typeof actionData>().pipe(
      Match.when(
        undefined,
        identity
      ),
      Match.tag('InvoiceName', () => {
        setShowForm(false)
        if (setInvoiceUpdate) setInvoiceUpdate(undefined)
      }),
      Match.tag('SimpleTaggedError', ({ message }) => {
        setErrorMessage(message)
      }),
      Match.orElse(() => {
        setErrorMessage('Une erreur inconnue est survenue lors de la création de la facture.')
      })
    )

    match(actionData)
  }, [actionData, setShowForm, setInvoiceUpdate])

  const personnes = [
    { id: 'maé' as const, name: 'Maé' },
    { id: 'charles' as const, name: 'Charles' },
    { id: 'brigitte' as const, name: 'Brigitte' }
  ]

  // Filtrer les personnes disponibles pour les remboursements
  const availableDrivers =
    selectedKind === 'Remboursement' || selectedKind === 'Carburant' && selectedToDriver ?
      personnes.filter(p => p.id !== selectedToDriver) :
      personnes

  const availableToDrivers =
    selectedKind === 'Remboursement' || selectedKind === 'Carburant' && selectedDriver ?
      personnes.filter(p => p.id !== selectedDriver) :
      personnes

  return (
    <AnimatePresence>
      {(showForm || updateInvoice) && (
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
                className="text-lg lg:text-xl text-[#004D55] flex items-center gap-2 font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                <Receipt className="h-5 w-5 text-[#004D55]" />

                <span className="text-base lg:text-xl">
                  {updateInvoice ? 'Modifier une facture' : 'Créer une nouvelle facture'}
                </span>
              </CardTitle>
            </CardHeader>

            {errorMessage && (
              <div className="m-6 p-4 text-red-700 bg-red-100 rounded">
                {errorMessage}
              </div>
            )}

            <CardContent>
              <Form
                method="post"
                className="space-y-4"
                encType="multipart/form-data"
                key={updateInvoice?.id || 'new-invoice'}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="hidden">
                    <Label>
                      Hidden tag
                    </Label>

                    <Input
                      type="hidden"
                      name="_tag"
                      defaultValue={updateInvoice ? 'update' : 'create'}
                    />
                    {updateInvoice && (
                      <Input
                        type="hidden"
                        name="id"
                        defaultValue={updateInvoice.id}
                      />
                    )}
                  </div>
                  <div>
                    <Label
                      className="text-[#004D55] text-sm lg:text-base font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Date <span className="text-red-500">*</span>
                    </Label>

                    <Input
                      type="date"
                      name="date"
                      required
                      defaultValue={updateInvoice ?
                        updateInvoice.date.toISOString().split('T')[0] :
                        new Date().toISOString().split('T')[0]}
                      className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="type"
                      className="text-[#004D55] text-sm lg:text-base font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="kind"
                      required
                      defaultValue={updateInvoice?.kind}
                      // @ts-expect-error  // Le type est bien respecté par le Select
                      onValueChange={setSelectedKind}
                    >
                      <SelectTrigger
                        className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {facturesKinds.map(type => (
                          <SelectItem key={type} value={type}>
                            <span
                              className="text-sm lg:text-base font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {type}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    required
                    defaultValue={updateInvoice?.name}
                    className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  />
                </div>
                <div>
                  <Label
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Kilométrage
                  </Label>
                  <Input
                    type="number"
                    name="mileage"
                    min="0"
                    step="1"
                    defaultValue={updateInvoice?.mileage}
                    className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  />
                </div>
                <div>
                  <Label
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Montant (€) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={updateInvoice?.amount}
                    className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  />
                </div>

                <div>
                  <Label
                    className="text-[#004D55] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Payé par <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="driver"
                    required
                    defaultValue={updateInvoice?.driver}
                    onValueChange={setSelectedDriver}
                  >
                    <SelectTrigger
                      className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <SelectValue placeholder="Sélectionner un conducteur" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableDrivers.map(personne => (
                        <SelectItem key={personne.id} value={personne.id}>
                          <span
                            className="text-sm lg:text-base font-body"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {personne.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedKind === 'Remboursement' || selectedKind === 'Carburant') && (
                  <div>
                    <Label
                      className="text-[#004D55] text-sm lg:text-base font-body"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {selectedKind === 'Remboursement' ? 'Remboursement à' : 'Payé pour'}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="toDriver"
                      required
                      defaultValue={updateInvoice?.toDriver}
                      onValueChange={setSelectedToDriver}
                    >
                      <SelectTrigger
                        className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <SelectValue placeholder="Sélectionner un conducteur" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availableToDrivers.map(personne => (
                          <SelectItem key={personne.id} value={personne.id}>
                            <span
                              className="text-sm lg:text-base font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {personne.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  {updateInvoice?.fileName ?
                    (
                      <div className="mb-3 p-3 bg-blue-50
                    
                     border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-blue-600 " />
                              <div className="font-bold">
                                Télécharger la facture actuelle :
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={{
                                  pathname: '/invoices/download',
                                  search:
                                    `?fileName=${updateInvoice.fileName}&id=${updateInvoice.id}`
                                }}
                                download
                                reloadDocument
                                className="flex items-center gap-2 hover:underline"
                              >
                                <span className="text-sm text-blue-800 font-medium">
                                  {updateInvoice.fileName}
                                </span>
                                <Download className="h-5 w-5" />
                              </Link>
                              <Button
                                onClick={() =>
                                  setInvoiceUpdate && setInvoiceUpdate({
                                    ...updateInvoice,
                                    fileName: undefined
                                  })}
                                name="_tag"
                                value="delete-attachment"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 hover:bg-red-50 text-red-600 hover:text-red-700  cursor-pointer" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {updateInvoice && (
                          <p className="text-xs text-blue-600 mt-1">
                            Vous pouvez uploader un nouveau fichier pour une facture existante.
                          </p>
                        )}
                      </div>
                    ) :
                    (
                      <>
                        <Label
                          className="text-[#004D55] text-sm lg:text-base font-body"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Un fichier pdf/image ?
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf, .png, .jpg, .jpeg"
                          name="fileBytes"
                          className="bg-white border-gray-300 text-sm lg:text-base min-h-[44px] focus:border-[#004D55] focus:ring-[#004D55]/20 font-body"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </>
                    )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#004D55] hover:bg-[#003640] text-sm lg:text-base py-2 lg:py-3 min-h-[44px] font-body text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {isLoading ? <Loader /> : updateInvoice ?
                    (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Valider
                      </>
                    ) :
                    (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter la facture
                      </>
                    )}
                </Button>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
