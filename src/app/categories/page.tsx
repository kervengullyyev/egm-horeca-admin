"use client";

import { useState, useEffect } from "react";
import { 
  Home, 
  FolderOpen, 
  Package, 
  ClipboardList, 
  Users, 
  MessageCircle, 
  Settings, 
  User, 
  LogOut,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api, Category } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ro: "",
    slug: "",
    description_en: "",
    description_ro: "",
    image_url: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "categories", label: "Categories", icon: FolderOpen, href: "/categories" },
    { id: "products", label: "Products", icon: Package, href: "/products" },
    { id: "orders", label: "Orders", icon: ClipboardList, href: "/orders" },
    { id: "users", label: "Users", icon: Users, href: "/users" },
    { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
    { id: "misc", label: "Extra Settings", icon: Settings, href: "/extra-settings" },
  ];

  const bottomMenuItems = [
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
    { id: "logout", label: "Logout", icon: LogOut, href: "/logout" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debug: Log when categories state changes
  useEffect(() => {
    console.log("Categories state updated:", categories);
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fetching categories from API...");
      const data = await api.getCategories();
      console.log("Categories fetched:", data);
      console.log("Categories with images:", data.filter(cat => cat.image_url));
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable must be set');
      }
      
      const response = await fetch(`${backendUrl}/api/v1/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = () => {
    if (formData.name_en) {
      const slug = formData.name_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setUploading(true);
      
      let imageUrl = formData.image_url;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const categoryData = {
        ...formData,
        image_url: imageUrl
      };
      
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryData);
        console.log("Category updated successfully");
      } else {
        await api.createCategory(categoryData);
        console.log("Category created successfully");
      }
      
      closeModal();
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en,
      name_ro: category.name_ro,
      slug: category.slug,
      description_en: category.description_en || "",
      description_ro: category.description_ro || "",
      image_url: category.image_url || ""
    });
    setImagePreview(category.image_url || "");
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (categoryId: number) => {
    try {
      await api.deleteCategory(categoryId);
      fetchCategories(); // Refresh the list
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setFormData({
      name_en: "",
      name_ro: "",
      slug: "",
      description_en: "",
      description_ro: "",
      image_url: ""
    });
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name_en: "",
      name_ro: "",
      slug: "",
      description_en: "",
      description_ro: "",
      image_url: ""
    });
    setImageFile(null);
    setImagePreview("");
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name_ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Menu Items */}
        <div className="p-4 border-t border-gray-800">
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage your product categories</p>
          </div>
          
          {/* Search and Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
            </div>
            
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button onClick={openNewCategoryModal}>
                  <Plus className="h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory ? 'Update the category information below.' : 'Create a new category by filling out the form below.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Name *
                    </label>
                    <Input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      onBlur={generateSlug}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Romanian Name *
                    </label>
                    <Input
                      type="text"
                      name="name_ro"
                      value={formData.name_ro}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <Input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Description
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Romanian Description
                    </label>
                    <textarea
                      name="description_ro"
                      value={formData.description_ro}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image
                    </label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {(imagePreview || formData.image_url) && (
                        <div className="relative">
                          <Image 
                            src={imagePreview || formData.image_url} 
                            alt="Preview" 
                            width={400}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setImageFile(null);
                              setFormData(prev => ({ ...prev, image_url: "" }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
                
                <DialogFooter>
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploading}
                    onClick={handleSubmit}
                  >
                    {uploading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{categoryToDelete?.name_en}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => categoryToDelete && handleDelete(categoryToDelete.id)}
              >
                Delete Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Categories Table */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories ({filteredCategories.length})</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading categories...</div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <div className="text-gray-400 text-lg">No categories found</div>
                  <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <div className="text-gray-400 text-lg">No categories found</div>
                  <p className="text-gray-500 mt-2">Create your first category to get started</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Table Headers */}
              <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 rounded-lg mb-4 font-medium text-gray-700">
                <div>ID</div>
                <div>Image</div>
                <div>English Name</div>
                <div>Romanian Name</div>
                <div>Slug</div>
                <div>Actions</div>
              </div>

              {/* Categories List */}
              {filteredCategories.map((category) => (
                <div key={category.id} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                  <div className="font-medium">{category.id}</div>
                  <div className="flex items-center">
                    {category.image_url ? (
                      <div className="relative">
                        <Image 
                          src={category.image_url} 
                          alt={category.name_en}
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
                  <div>{category.name_en}</div>
                  <div>{category.name_ro}</div>
                  <div className="text-sm text-gray-600">{category.slug}</div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                                            <button 
                          onClick={() => openDeleteDialog(category)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}