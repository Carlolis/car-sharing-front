import type { Row } from '@tanstack/react-table'
import type { SubmitFunction } from 'react-router'
import { TaggedDeleteTrip } from './DashboardArguments'

type DeleteButtonProps = {
  row?: Row<{
    readonly id: string
    readonly name: string
    readonly startDate: Date
    readonly endDate: Date
    readonly distance: number
    readonly drivers: readonly ('maé' | 'charles' | 'brigitte')[]
  }>
  submit?: SubmitFunction
}

export const DeleteButton = ({ row, submit }: DeleteButtonProps): JSX.Element => {
  const handleClick = () => {
    if (!row || !submit) return
    const taggedDeletedTrip = TaggedDeleteTrip.make({
      tripId: row.original.id
    })
    submit(taggedDeletedTrip, {
      action: '/dashboard',
      method: 'post',
      encType: 'application/json'
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-150"
      aria-label="Supprimer le trajet"
    >
      Supprimer
    </button>
  )
}
