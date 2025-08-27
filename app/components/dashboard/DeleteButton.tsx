import type { SubmitFunction } from 'react-router'

import { Trash2 } from 'lucide-react'

import { TaggedDeleteInvoice } from '../invoice/InvoiceActions'
import { Button } from '../ui/button'
import { TaggedDeleteTrip } from './TripActions'

type DeleteButtonProps = {
  id?: string
  submit?: SubmitFunction
  entityType: 'trip' | 'invoice'
}

export const DeleteButton = ({ id, submit, entityType }: DeleteButtonProps): JSX.Element => {
  const handleClick = () => {
    if (!id || !submit) return

    if (entityType === 'trip') {
      const taggedDeletedTrip = TaggedDeleteTrip.make({
        tripId: id
      })
      submit(taggedDeletedTrip, {
        method: 'post',
        encType: 'application/json'
      })
    } else if (entityType === 'invoice') {
      const taggedDeletedInvoice = TaggedDeleteInvoice.make({
        invoiceId: id
      })
      submit(taggedDeletedInvoice, {
        method: 'post',
        encType: 'multipart/form-data'
      })
    }
  }

  return (
    <Button
      onClick={handleClick}
      type="button"
      className="bg-red-600 hover:bg-red-700 text-white font-body"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <Trash2
        className={`h-4 w-4 lg:h-5 lg:w-5 mr-2 transition-transform duration-200 `}
      />

      Supprimer
    </Button>
  )
}
