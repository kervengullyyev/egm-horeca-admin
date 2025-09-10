"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product, Category } from "@/lib/api"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Image as ImageIcon, Package } from "lucide-react"
import Image from "next/image"

interface ProductsColumnsProps {
  categories: Category[]
  onEdit: (product: Product) => void
  onVariants: (product: Product) => void
  onDelete: (product: Product) => void
}

export const createColumns = ({ categories, onEdit, onVariants, onDelete }: ProductsColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "images",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Images" />
    ),
    cell: ({ row }) => {
      const images = row.getValue("images") as string[]
      return (
        <div className="flex items-center gap-2">
          {images && images.length > 0 ? (
            <div className="flex gap-1">
              {images.slice(0, 2).map((image, index) => (
                <div key={index} className="relative">
                  <Image 
                    src={image} 
                    alt={`Product ${index + 1}`}
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
              ))}
              {images.length > 2 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  +{images.length - 2}
                </div>
              )}
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name_en")}</div>,
  },
  {
    accessorKey: "category_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const categoryId = row.getValue("category_id") as number
      const category = categories.find(c => c.id === categoryId)
      return (
        <div className="text-sm text-gray-600">
          {category?.name_en || 'Unknown'}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      return <div className="font-medium">{price} RON</div>
    },
  },
  {
    accessorKey: "stock_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock_quantity") as number
      return <div className="text-sm text-gray-600">{stock}</div>
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }) => {
      const brand = row.getValue("brand") as string
      return (
        <div className="text-sm text-gray-600">
          {brand || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
    cell: ({ row }) => {
      const sku = row.getValue("sku") as string
      return (
        <div className="text-sm text-gray-600">
          {sku || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: "has_variants",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Variants" />
    ),
    cell: ({ row }) => {
      const hasVariants = row.getValue("has_variants") as boolean
      return (
        <div className="text-sm">
          {hasVariants ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              No
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVariants(product)}
            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
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
