"use client";

import { useState, useEffect } from "react";
// Icons are used in the columns file, not directly in this component
import api, { User } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import AdminLayout from "@/components/AdminLayout";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    role: "customer",
    is_active: true,
    // Address and entity information
    entity_type: "individual",
    tax_id: "",
    company_name: "",
    trade_register_no: "",
    bank_name: "",
    iban: "",
    county: "",
    city: "",
    address: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };



  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone || "",
      role: user.role,
      is_active: user.is_active,
      // Address and entity information
      entity_type: user.entity_type || "individual",
      tax_id: user.tax_id || "",
      company_name: user.company_name || "",
      trade_register_no: user.trade_register_no || "",
      bank_name: user.bank_name || "",
      iban: user.iban || "",
      county: user.county || "",
      city: user.city || "",
      address: user.address || ""
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, formData);
      console.log("User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await api.deleteUser(selectedUser.id);
      console.log("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      username: "",
      full_name: "",
      phone: "",
      role: "customer",
      is_active: true,
      // Address and entity information
      entity_type: "individual",
      tax_id: "",
      company_name: "",
      trade_register_no: "",
      bank_name: "",
      iban: "",
      county: "",
      city: "",
      address: ""
    });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };


  return (
    <AdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and information</p>
          </div>
        </div>

        {/* Customers Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Action Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
              </div>
            </div>

            {/* Users Data Table */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-lg">{error}</div>
                  <button 
                    onClick={fetchUsers}
                    className="mt-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <DataTable 
                  columns={createColumns({ 
                    onView: handleViewUser, 
                    onEdit: handleEditUser, 
                    onDelete: handleDeleteUser 
                  })} 
                  data={users}
                  searchKey="full_name"
                  searchPlaceholder="Search users by name, username, or email..."
                  initialSorting={[{ id: "id", desc: false }]}
                />
              )}
            </div>
          </div>
        </div>

      {/* View User Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="!max-w-5xl !w-full sm:!max-w-5xl md:!max-w-5xl lg:!max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <>
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono">
                      {selectedUser.id}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {selectedUser.full_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {selectedUser.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {selectedUser.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {selectedUser.phone || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {selectedUser.updated_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                        {new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Address Information */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Address Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          <span className="capitalize">{selectedUser.entity_type || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          {selectedUser.county || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          {selectedUser.city || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          {selectedUser.address || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="capitalize">{selectedUser.role}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Company Information */}
                  {selectedUser.entity_type === 'company' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {selectedUser.company_name || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {selectedUser.tax_id || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Trade Register No.</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {selectedUser.trade_register_no || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {selectedUser.bank_name || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {selectedUser.iban || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button - Full Width at Bottom */}
              <div className="pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={closeViewModal}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="!max-w-5xl !w-full sm:!max-w-5xl md:!max-w-5xl lg:!max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Address Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Address Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Type *
                      </label>
                      <select
                        name="entity_type"
                        value={formData.entity_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                      >
                        <option value="individual">Individual Person</option>
                        <option value="company">Legal Entity/Company</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <Input
                        type="text"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      User is active
                    </label>
                  </div>
                </div>

                {/* Company Information */}
                {formData.entity_type === 'company' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <Input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID *
                        </label>
                        <Input
                          type="text"
                          name="tax_id"
                          value={formData.tax_id}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Register No.
                        </label>
                        <Input
                          type="text"
                          name="trade_register_no"
                          value={formData.trade_register_no}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN
                        </label>
                        <Input
                          type="text"
                          name="iban"
                          value={formData.iban}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t">
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitEdit}
                  className="flex-1"
                >
                  Update User
                </Button>
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedUser?.full_name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
