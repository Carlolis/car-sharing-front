import { Download, Edit3, FileText, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useSubmit } from 'react-router'
import { DeleteButton } from '../dashboard/DeleteButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { Button } from '../ui/button'

interface TableEditAndDeleteProps<
  T extends {
    fileName?: string
    id: string
  },
> {
  setDataUpdate: (data: T) => void
  data: T
  getValue: () => string | undefined
  entityType: 'trip' | 'invoice'
}

export const TableEditAndDelete = <
  T extends {
    fileName?: string
    id: string
  },
>(
  { setDataUpdate, data, getValue, entityType }: TableEditAndDeleteProps<T>
) => {
  const submit = useSubmit()

  return (
    <div className="flex sm:flex-row flex-col  items-center  ">
      {data.fileName && data.id && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-[#004D55]/10 text-[#6B7280] hover:text-[#004D55]"
        >
          <Link
            to={{
              pathname: '/invoices/download',
              search: `?fileName=${data.fileName}&id=${data.id}`
            }}
            download
            reloadDocument
            title={data.fileName ? 'Voir le PDF' : 'Aucun PDF disponible'}
          >
            <FileText className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setDataUpdate(data)
        }}
        className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <Edit3 className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700  cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-lg text-[#004D55] font-heading"
              style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
            >
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[#6B7280] font-body"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Est-ce que tu es sûr de supprimer ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 flex flex-row justify-around px-4">
            <AlertDialogCancel
              className="border-gray-300 text-[#004D55] hover:bg-gray-50 font-body max-w-20"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Non
            </AlertDialogCancel>
            <AlertDialogAction
              className="max-w-60"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <DeleteButton
                id={getValue()}
                submit={submit}
                entityType={entityType}
              />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
