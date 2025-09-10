"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Eye, Edit, Package, Truck, CheckCircle, XCircle, Clock, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import AdminLayout from "@/components/AdminLayout";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (orderId: string, updates: { order_status?: string; payment_status?: string }) => {
    try {
      await api.updateOrder(orderId, updates);
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updates }
          : order
      ));
      
      setShowEditModal(false);
      setEditingOrder(null);
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      setLoadingOrderDetails(true);
      setShowViewModal(true);
      // Fetch detailed order data including items
      const detailedOrder = await api.getOrder(order.id);
      setViewingOrder(detailedOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to basic order data if detailed fetch fails
      setViewingOrder(order);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer orders and track payment status</p>
          </div>
        </div>

        {/* Orders Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Action Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {orders.length} orders
                </div>
              </div>
            </div>

            {/* Orders Data Table */}
            <div className="px-6 pt-2 pb-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading orders...</div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button 
                      onClick={fetchOrders}
                      className="mt-2 text-red-600 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <DataTable 
                  columns={createColumns({ 
                    onView: handleViewOrder, 
                    onEdit: handleEditOrder, 
                    getPaymentStatusIcon, 
                    getPaymentStatusColor, 
                    getStatusIcon, 
                    getStatusColor, 
                    formatDate 
                  })} 
                  data={orders}
                  searchKey="customer_name"
                  searchPlaceholder="Search orders by customer name, order number, or email..."
                  initialSorting={[{ id: "created_at", desc: true }]}
                />
              )}
            </div>
          </div>
        </div>

      {/* Edit Order Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="!max-w-5xl !w-full sm:!max-w-5xl md:!max-w-5xl lg:!max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update the payment and order status for this order.
            </DialogDescription>
          </DialogHeader>
          
          {editingOrder && (
            <>
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {editingOrder.order_number}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {editingOrder.customer_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Email
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {editingOrder.customer_email}
                    </div>
                  </div>

                  {/* Customer Phone */}
                  {editingOrder.customer_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Phone
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        {editingOrder.customer_phone}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {formatDate(editingOrder.created_at)}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {editingOrder.shipping_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                        {editingOrder.shipping_address.county && <div>County: {editingOrder.shipping_address.county}</div>}
                        {editingOrder.shipping_address.city && <div>City: {editingOrder.shipping_address.city}</div>}
                        {editingOrder.shipping_address.address && <div>Address: {editingOrder.shipping_address.address}</div>}
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  {editingOrder.company_name && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {editingOrder.company_name}
                          </div>
                        </div>
                        {editingOrder.tax_id && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tax ID
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {editingOrder.tax_id}
                            </div>
                          </div>
                        )}
                        {editingOrder.trade_register_no && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Trade Register No.
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {editingOrder.trade_register_no}
                            </div>
                          </div>
                        )}
                        {editingOrder.bank_name && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {editingOrder.bank_name}
                            </div>
                          </div>
                        )}
                        {editingOrder.iban && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              IBAN
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {editingOrder.iban}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={editingOrder.payment_status}
                      onChange={(e) => setEditingOrder({...editingOrder, payment_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={editingOrder.order_status}
                      onChange={(e) => setEditingOrder({...editingOrder, order_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Pricing Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Pricing Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{editingOrder.currency} {editingOrder.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (21%):</span>
                        <span className="font-medium">{editingOrder.currency} {editingOrder.tax_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-semibold">Total:</span>
                        <span className="text-gray-900 font-semibold">{editingOrder.currency} {editingOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{editingOrder.payment_method || 'Stripe'}</span>
                      </div>
                      {editingOrder.stripe_session_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stripe Session
                          </label>
                          <div className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono break-all">
                            {editingOrder.stripe_session_id}
                          </div>
                        </div>
                      )}
                      {editingOrder.receipt_url && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Receipt
                          </label>
                          <a 
                            href={editingOrder.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                          >
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Section - Separate Row */}
              {editingOrder.items && editingOrder.items.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Order Items ({editingOrder.items.length})</h4>
                  <div className="space-y-3">
                    {editingOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                          {item.variant_name && item.variant_value_en && (
                            <p className="text-sm text-gray-600">
                              {item.variant_name}: {item.variant_value_en}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">SKU: {item.product_slug}</p>
                        </div>
                        
                        {/* Quantity and Price */}
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {editingOrder.currency} {item.total_price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} × {editingOrder.currency} {item.unit_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t">
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUpdateOrder(editingOrder.id, {
                      payment_status: editingOrder.payment_status,
                      order_status: editingOrder.order_status
                    })}
                    className="flex-1"
                  >
                    Update Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrder(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="!max-w-5xl !w-full sm:!max-w-5xl md:!max-w-5xl lg:!max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order.
            </DialogDescription>
          </DialogHeader>
          
          {loadingOrderDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600 ml-4">Loading order details...</div>
            </div>
          ) : viewingOrder && (
            <>
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {viewingOrder.order_number}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {viewingOrder.customer_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Email
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {viewingOrder.customer_email}
                    </div>
                  </div>

                  {/* Customer Phone */}
                  {viewingOrder.customer_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Phone
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        {viewingOrder.customer_phone}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {formatDate(viewingOrder.created_at)}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {viewingOrder.shipping_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                        {viewingOrder.shipping_address.county && <div>County: {viewingOrder.shipping_address.county}</div>}
                        {viewingOrder.shipping_address.city && <div>City: {viewingOrder.shipping_address.city}</div>}
                        {viewingOrder.shipping_address.address && <div>Address: {viewingOrder.shipping_address.address}</div>}
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  {viewingOrder.company_name && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {viewingOrder.company_name}
                          </div>
                        </div>
                        {viewingOrder.tax_id && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tax ID
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {viewingOrder.tax_id}
                            </div>
                          </div>
                        )}
                        {viewingOrder.trade_register_no && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Trade Register No.
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {viewingOrder.trade_register_no}
                            </div>
                          </div>
                        )}
                        {viewingOrder.bank_name && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {viewingOrder.bank_name}
                            </div>
                          </div>
                        )}
                        {viewingOrder.iban && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              IBAN
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                              {viewingOrder.iban}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(viewingOrder.payment_status)}`}>
                        {viewingOrder.payment_status.charAt(0).toUpperCase() + viewingOrder.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingOrder.order_status)}`}>
                        {viewingOrder.order_status.charAt(0).toUpperCase() + viewingOrder.order_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Pricing Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{viewingOrder.currency} {viewingOrder.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (21%):</span>
                        <span className="font-medium">{viewingOrder.currency} {viewingOrder.tax_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-semibold">Total:</span>
                        <span className="text-gray-900 font-semibold">{viewingOrder.currency} {viewingOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>



                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{viewingOrder.payment_method || 'Stripe'}</span>
                      </div>
                      {viewingOrder.stripe_session_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stripe Session
                          </label>
                          <div className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono break-all">
                            {viewingOrder.stripe_session_id}
                          </div>
                        </div>
                      )}
                      {viewingOrder.receipt_url && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Receipt
                          </label>
                          <a 
                            href={viewingOrder.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                          >
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items Section - Separate Row */}
              {viewingOrder.items && viewingOrder.items.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Order Items ({viewingOrder.items.length})</h4>
                  <div className="space-y-3">
                    {viewingOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                          {item.variant_name && item.variant_value_en && (
                            <p className="text-sm text-gray-600">
                              {item.variant_name}: {item.variant_value_en}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">SKU: {item.product_slug}</p>
                        </div>
                        
                        {/* Quantity and Price */}
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {viewingOrder.currency} {item.total_price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} × {viewingOrder.currency} {item.unit_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Close Button - Full Width at Bottom */}
              <div className="pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingOrder(null);
                    setLoadingOrderDetails(false);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
