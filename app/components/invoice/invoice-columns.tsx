"use client"

import { type ColumnDef } from "@tanstack/react-table"

import { type Invoice } from "~/types/Invoice"

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "distance",
    header: "Distance",
  },
  {
    accessorKey: "drivers",
    header: "Drivers",
    cell: ({ row }) => {
      const drivers = row.getValue("drivers") as string[]
      return drivers.join(", ")
    },
  },
]