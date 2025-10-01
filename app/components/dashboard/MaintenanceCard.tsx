import { Wrench } from 'lucide-react'
import { useMemo } from 'react'
import type { Car } from '~/types/Car'
import type { NextMaintenances } from '~/types/NextMaintenance'
import { StatsCard } from './StatsCard'

interface MaintenanceCardProps {
  car: Car
  nextMaintenances: NextMaintenances
}

export function MaintenanceCard({ car, nextMaintenances }: MaintenanceCardProps) {
  const maintenanceInfo = useMemo(() => {
    if (!nextMaintenances || !nextMaintenances[0]) {
      return 'Aucun entretien à venir'
    }

    const [prioMaint, sndMaint] = nextMaintenances
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const remainingMileage = prioMaint.dueMileage ? prioMaint.dueMileage - car.mileage : null
    const isOverdueByMileage = remainingMileage !== null && remainingMileage <= 0

    const maintDate = sndMaint?.dueDate || prioMaint.dueDate
    const isOverdueByDate = maintDate && maintDate < today

    // Case 1: Overdue states
    if (isOverdueByMileage && isOverdueByDate) {
      return `Entretien dépassé de ${Math.abs(remainingMileage)} km (devait être fait avant le ${maintDate.toLocaleDateString('fr-FR')})`
    }
    if (isOverdueByMileage) {
      return `Entretien kilométrique dépassé de ${Math.abs(remainingMileage)} km`
    }
    if (isOverdueByDate) {
      return `Entretien en retard (devait être fait avant le ${maintDate.toLocaleDateString('fr-FR')})`
    }

    // Case 2: Upcoming states
    const textParts: string[] = []
    if (remainingMileage !== null) {
      textParts.push(`Dans ${remainingMileage} km`)
    }
    if (maintDate) {
      textParts.push(`le ${maintDate.toLocaleDateString('fr-FR')}`)
    }

    if (textParts.length > 0) {
      return textParts.join(' ou ')
    }

    return 'Date ou kilométrage non spécifié'
  }, [car, nextMaintenances])

  return (
    <StatsCard
      title="Prochain entretien"
      value={maintenanceInfo}
      subtitle={`${car.name} - ${car.mileage} km`}
      icon={Wrench}
      bgColor="entretien"
    />
  )
}
