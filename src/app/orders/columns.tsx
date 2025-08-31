"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/api"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"

interface OrdersColumnsProps {
  onView: (order: Order) => void
  onEdit: (order: Order) => void
  getPaymentStatusIcon: (status: string) => React.ReactNode
  getPaymentStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
}

export const createColumns = ({ 
  onView, 
  onEdit, 
  getPaymentStatusIcon, 
  getPaymentStatusColor, 
  getStatusIcon, 
  getStatusColor, 
  formatDate 
}: OrdersColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Details" />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="font-medium">{order.order_number}</div>
          <div className="text-sm text-gray-500">
            {order.order_items_count} item{order.order_items_count !== 1 ? 's' : ''}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="font-medium">{order.customer_name}</div>
          <div className="text-sm text-gray-500">{order.customer_email}</div>
          {order.company_name && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1">
              Company
          </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "customer_phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div className="text-sm text-gray-600">
            {order.customer_phone || 'No phone'}
          </div>
          {order.company_name && (
            <div className="text-xs text-gray-500 truncate" title={order.company_name}>
              {order.company_name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="font-medium">
          {order.currency} {order.total_amount.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as string
      return (
        <div className="flex items-center">
          {getPaymentStatusIcon(status)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "order_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("order_status") as string
      return (
        <div className="flex items-center">
          {getStatusIcon(status)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
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
          {formatDate(date)}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(order)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(order)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
