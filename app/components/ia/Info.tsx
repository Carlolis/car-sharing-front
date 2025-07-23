// app/components/ia/Info.tsx

import type React from 'react'
import { FaCircle } from 'react-icons/fa'
import { GiBrain } from 'react-icons/gi'
import { MdOutlineGppBad } from 'react-icons/md'

export const Info: React.FC = () => (
  <div className="mt-8 text-left">
    <div className="bg-white -700 p-4 rounded-md shadow-md border border-gray-300 d">
      <h3 className="text-md text-gray-900 ">
        Rapidité des modèles
      </h3>
      <ul className="text-sm text-gray-600  list-disc list-inside">
        <li>
          <FaCircle className="inline-block mr-1 text-red-600" /> très lent
        </li>
        <li>
          <FaCircle className="inline-block mr-1 text-yellow-600" /> lent
        </li>
        <li>
          <FaCircle className="inline-block mr-1 text-green-600" /> rapide
        </li>
        <li>
          <FaCircle className="inline-block mr-1 text-blue-600" /> très rapide
        </li>
      </ul>
      <div className="text-sm text-gray-900 ">
        À la sélection d&apos;un nouveau modèle exécution , le lancement peut être lent.
      </div>
    </div>
    <div className="bg-white  p-4 rounded-md shadow-md border border-gray-300 mt-4">
      <ul className="text-sm text-gray-600  list-disc list-inside">
        <li>
          <MdOutlineGppBad className="inline-block mr-1 text-red-600" />
          Modèle censuré. Exemple: Tiananmen en 1989.
        </li>
        <li>
          <GiBrain className="inline-block mr-1 text-purple-600" />{' '}
          Modèle de Raisonnement Avancé (SRA)
        </li>
      </ul>
    </div>
  </div>
)
