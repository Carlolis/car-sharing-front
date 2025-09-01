import { ArrowRight, Check, CreditCard, DollarSign, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import type { Reimbursement as ReimbursementType } from '~/types/Reimbursement'
import { Button } from '../ui/button'
import { Card, CardHeader } from '../ui/card'

interface ReimbursementProps {
  reimbursements: readonly ReimbursementType[]
  fairPart: number
}

export const Reimbursement = ({ reimbursements, fairPart }: ReimbursementProps) => {
  const [loadingIds, setLoadingIds] = useState(new Set<string>())
  const fetcher = useFetcher()

  const createInvoiceReimbursement = (
    suggestion: { de: string; vers: string; montant: number }
  ) => {
    const suggestionId = `${suggestion.de}-${suggestion.vers}`
    setLoadingIds(prev => new Set(prev).add(suggestionId))

    const formData = new FormData()
    formData.append('_tag', 'create')
    formData.append('name', `De ${suggestion.de} à ${suggestion.vers}`)
    formData.append('date', new Date().toISOString().split('T')[0])
    formData.append('mileage', '')
    formData.append('amount', suggestion.montant.toString())
    formData.append('driver', suggestion.de)
    formData.append('kind', 'Remboursement')

    formData.append('toDriver', suggestion.vers)

    fetcher.submit(formData, { method: 'post' })
  }

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setLoadingIds(new Set())
    }
  }, [fetcher.state])

  const suggestions = reimbursements.map(reimbursement => {
    const toEntries = Object.entries(reimbursement.to)
    return toEntries.map(([toDriver, amount]) => ({
      de: reimbursement.driverName,
      vers: toDriver,
      colorDe: '#004D55',
      colorVers: '#6B7280',
      montant: amount
    }))
  }).flat().filter(suggestion => suggestion.montant > 0)

  return (
    <Card className="bg-white border-gray-200 shadow-lg overflow-hidden p-2">
      <CardHeader className="flex items-center gap-3 w-full p-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="min-w-[24px] min-h-[24px] flex items-center justify-center"
        >
          <CreditCard className="h-5 w-5 text-[#004D55]" />
        </motion.div>
        <span
          className="text-lg lg:text-xl text-[#004D55] font-semibold text-left font-heading"
          style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
        >
          Suggestions de remboursements
        </span>
      </CardHeader>

      {suggestions.length > 0 ?
        (
          <div className="space-y-4">
            {/* Résumé des parts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {reimbursements.map((reimbursement, index) => (
                <motion.div
                  key={`${reimbursement.driverName}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 lg:p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-white shadow-sm min-w-[32px] min-h-[32px]"
                      style={{ backgroundColor: '#004D55' }}
                    >
                      <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <h4
                        className="font-semibold text-[#004D55] text-sm lg:text-base font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {reimbursement.driverName}
                      </h4>

                      <p
                        className="text-xs text-[#6B7280] font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {reimbursement.totalAmount === 0 ?
                          'Comptes équilibrés' :
                          reimbursement.totalAmount < 0 ?
                          "Recevra de l'argent" :
                          "Doit de l'argent"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between border-gray-200 ">
                      <span
                        className="text-xs lg:text-sm text-[#6B7280] font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        A payé :
                      </span>

                      <span
                        className={`font-bold text-sm lg:text-base font-body `}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {Math.abs(fairPart - reimbursement.totalAmount).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between  border-gray-200 ">
                      <span
                        className="text-xs lg:text-sm text-[#6B7280] font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Part équitable :
                      </span>

                      <span
                        className={`font-bold text-sm lg:text-base font-body`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {Math.abs(fairPart).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span
                        className="text-xs lg:text-sm text-[#6B7280] font-body"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Solde :
                      </span>

                      <span
                        className={`font-bold text-sm lg:text-base font-body ${
                          reimbursement.totalAmount <= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {-reimbursement.totalAmount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Suggestions de remboursements */}
            <div className="space-y-3">
              <h4
                className="font-semibold text-[#004D55] text-base lg:text-lg mb-4 font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                Remboursements suggérés pour équilibrer les comptes :
              </h4>
              <AnimatePresence mode="popLayout">
                {suggestions.map((suggestion, index) => {
                  const suggestionId = `${suggestion.de}-${suggestion.vers}-${index}`
                  const isLoading = loadingIds.has(`${suggestion.de}-${suggestion.vers}`)

                  return (
                    <motion.div
                      key={suggestionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Version Desktop */}
                      <div className="hidden lg:flex items-center justify-between p-4 lg:p-5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-white shadow-sm min-w-[32px] min-h-[32px]"
                              style={{ backgroundColor: suggestion.colorDe }}
                            >
                              <User className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <span
                              className="font-medium text-[#004D55] text-sm lg:text-base font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {suggestion.de}
                            </span>
                          </div>

                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            className="flex items-center text-[#6B7280]"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </motion.div>

                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-white shadow-sm min-w-[32px] min-h-[32px]"
                              style={{ backgroundColor: suggestion.colorVers }}
                            >
                              <User className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <span
                              className="font-medium text-[#004D55] text-sm lg:text-base font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {suggestion.vers}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <span
                            className="text-lg font-bold text-[#004D55] font-body"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {suggestion.montant.toFixed(2)} €
                          </span>

                          <Button
                            onClick={() => createInvoiceReimbursement(suggestion)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-[#004D55] to-[#003640] hover:from-[#003640] hover:to-[#002a30] text-white border-0 shadow-lg min-w-[44px] min-h-[44px] px-3 py-2 text-sm font-semibold font-body transition-all duration-300 hover:scale-105 disabled:opacity-50"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {isLoading ? 'Création...' : 'Marquer comme payé'}
                          </Button>
                        </div>
                      </div>

                      {/* Version Mobile */}
                      <div className="lg:hidden p-4">
                        {/* Header avec montant */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xl font-bold text-[#004D55] font-body"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {suggestion.montant.toFixed(2)} €
                          </span>
                          <Button
                            onClick={() => createInvoiceReimbursement(suggestion)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-[#004D55] to-[#003640] hover:from-[#003640] hover:to-[#002a30] text-white border-0 shadow-lg min-w-[44px] min-h-[44px] px-3 py-2 text-sm font-semibold font-body transition-all duration-300 hover:scale-105 disabled:opacity-50"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {isLoading ? 'Création...' : 'Payé'}
                          </Button>
                        </div>

                        {/* Transaction flow */}
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: suggestion.colorDe }}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <span
                              className="font-medium text-[#004D55] text-sm font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {suggestion.de}
                            </span>
                          </div>

                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            className="flex items-center text-[#6B7280]"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </motion.div>

                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: suggestion.colorVers }}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <span
                              className="font-medium text-[#004D55] text-sm font-body"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {suggestion.vers}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ) :
        (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#004D55]/20 to-[#003640]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-[#004D55]" />
            </div>
            <p
              className="text-[#6B7280] text-base lg:text-lg font-body"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Les comptes sont équilibrés ! 🎉
            </p>
            <p
              className="text-[#6B7280] text-sm mt-2 font-body"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Aucun remboursement n&apos;est nécessaire pour le moment.
            </p>
          </motion.div>
        )}
    </Card>
  )
}
