"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Message } from "@/lib/api"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"

interface MessagesColumnsProps {
  onView: (message: Message) => void
  onDelete: (message: Message) => void
  onStatusUpdate: (id: number, newStatus: string) => void
}

export const createColumns = ({ 
  onView, 
  onDelete, 
  onStatusUpdate 
}: MessagesColumnsProps): ColumnDef<Message>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">#{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From" />
    ),
    cell: ({ row }) => {
      const message = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{message.name}</div>
          <div className="text-sm text-gray-500">{message.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string
      return (
        <div className="text-sm text-gray-900 truncate">
          {subject || 'No subject'}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const message = row.original
      return (
        <select
          value={status}
          onChange={(e) => onStatusUpdate(message.id, e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return (
        <div className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const message = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(message)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(message)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
