import React, { useEffect, useState } from 'react'
import { TripCreate } from './api'

const Dashboard: React.FC = () => {
  const [trips, setTrips] = useState<TripCreate[]>([])

  useEffect(() => {
    // Fetch trips data from API or any other source
    // For demonstration, using static data
    const fetchTrips = async () => {
      const data: TripCreate[] = [
        {
          name: 'Trip to Paris',
          date: new Date('2023-10-01'),
          distance: 300,
          drivers: ['John Doe', 'Jane Smith']
        },
        {
          name: 'Trip to Berlin',
          date: new Date('2023-10-05'),
          distance: 500,
          drivers: ['Alice Johnson']
        }
      ]
      setTrips(data)
    }

    fetchTrips()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        Statistiques Globales
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
            <p className="text-gray-700">Date: {trip.date.toDateString()}</p>
            <p className="text-gray-700">Distance: {trip.distance} km</p>
            <p className="text-gray-700">Drivers:</p>
            <ul className="list-disc list-inside">
              {trip.drivers.map((driver, idx) => (
                <li key={idx} className="text-gray-700">{driver}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard