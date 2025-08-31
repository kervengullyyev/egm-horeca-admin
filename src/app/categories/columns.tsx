"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Category } from "@/lib/api"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image_url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string
      return (
        <div className="flex items-center">
          {imageUrl ? (
            <div className="relative">
              <Image 
                src={imageUrl} 
                alt="Category"
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('.placeholder-fallback') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="placeholder-fallback hidden w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="English Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name_en")}</div>,
  },
  {
    accessorKey: "name_ro",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Romanian Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name_ro")}</div>,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">{row.getValue("slug")}</div>
    ),
  },
  {
    accessorKey: "description_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="English Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description_en") as string
      return (
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {description || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "description_ro",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Romanian Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description_ro") as string
      return (
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {description || "-"}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('editCategory', { detail: category }))
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('deleteCategory', { detail: category }))
            }}
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
