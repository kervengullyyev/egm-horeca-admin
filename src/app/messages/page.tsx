"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api, Message } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import AdminLayout from "@/components/AdminLayout";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);


  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await api.deleteMessage(id);
      await fetchMessages(); // Refresh the list
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openDeleteDialog = (message: Message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.updateMessage(id, { status: newStatus });
      await fetchMessages(); // Refresh the list
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };



  return (
    <AdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Manage customer inquiries and communications</p>
          </div>
        </div>

        {/* Messages Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Action Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
              </div>
            </div>

            {/* Messages Data Table */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading messages...</div>
                </div>
              ) : (
                <DataTable 
                  columns={createColumns({ 
                    onView: handleViewMessage, 
                    onDelete: openDeleteDialog, 
                    onStatusUpdate: handleStatusUpdate 
                  })} 
                  data={messages}
                  searchKey="name"
                  searchPlaceholder="Search messages by name, email, or subject..."
                />
              )}
            </div>
          </div>
        </div>

      {/* View Message Dialog */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View and manage customer message details
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="text-sm text-gray-900">{selectedMessage.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-sm text-gray-900">{selectedMessage.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="text-sm text-gray-900">{selectedMessage.subject || 'No subject'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                  {selectedMessage.message}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedMessage.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedMessage.id, e.target.value);
                    setSelectedMessage({ ...selectedMessage, status: e.target.value });
                  }}
                  className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="text-sm text-gray-900">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {messageToDelete && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>From:</strong> {messageToDelete.name}<br />
                <strong>Subject:</strong> {messageToDelete.subject || 'No subject'}
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteMessage(messageToDelete!.id)}
            >
              Delete Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
