import type { SubmitFunction } from 'react-router'

import { Trash2 } from 'lucide-react'

import { Button } from '../ui/button'

type DeleteButtonProps = {
  id?: string
  submit?: SubmitFunction
  entityType: 'trip' | 'invoice' | 'maintenance'
}

export const DeleteButton = ({ id, submit, entityType }: DeleteButtonProps): JSX.Element => {
  const handleClick = () => {
    if (!id || !submit) return

    if (entityType === 'trip') {
      submit({ _tag: 'delete', tripId: id }, {
        method: 'post',
        encType: 'application/json'
      })
    } else if (entityType === 'invoice') {
      submit({ _tag: 'delete', invoiceId: id }, {
        method: 'post',
        encType: 'multipart/form-data'
      })
    } else if (entityType === 'maintenance') {
      submit({ _tag: 'delete', maintenanceId: id }, {
        method: 'post',
        encType: 'application/x-www-form-urlencoded'
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
