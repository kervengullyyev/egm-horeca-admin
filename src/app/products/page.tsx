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
import { api, Product, Category, ProductVariant } from "@/lib/api";
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

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ro: "",
    slug: "",
    description_en: "",
    description_ro: "",
    short_description_en: "",
    short_description_ro: "",
    price: "",
    category_id: "",
    brand: "",
    sku: "",
    stock_quantity: "",
    images: ""
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantFormData, setVariantFormData] = useState({
    value_en: "",
    value_ro: "",
    price: "",
    stock_quantity: "",
    sku: ""
  });
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
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
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const images = formData.images.split(',').filter(img => img.trim());
    images.splice(index, 1);
    setFormData(prev => ({ ...prev, images: images.join(',') }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      
      let imageUrls = formData.images;
      
      // Upload new images if selected
      if (imageFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          imageFiles.map(file => uploadImage(file))
        );
        imageUrls = [...formData.images.split(',').filter(img => img.trim()), ...uploadedUrls].join(',');
      }
      
      const productData = {
        name_en: formData.name_en,
        name_ro: formData.name_ro,
        slug: formData.slug,
        description_en: formData.description_en,
        description_ro: formData.description_ro,
        short_description_en: formData.short_description_en,
        short_description_ro: formData.short_description_ro,
        price: parseFloat(formData.price) || 0,
        category_id: parseInt(formData.category_id) || 0,
        brand: formData.brand,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        images: imageUrls ? imageUrls.split(',').filter(img => img.trim()) : []
      };
      
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        console.log("Product updated successfully");
      } else {
        await api.createProduct(productData);
        console.log("Product created successfully");
      }
      
      closeModal();
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_en: product.name_en || "",
      name_ro: product.name_ro || "",
      slug: product.slug || "",
      description_en: product.description_en || "",
      description_ro: product.description_ro || "",
      short_description_en: product.short_description_en || "",
      short_description_ro: product.short_description_ro || "",
      price: product.price?.toString() || "",
      category_id: product.category_id?.toString() || "",
      brand: product.brand || "",
      sku: product.sku || "",
      stock_quantity: product.stock_quantity?.toString() || "",
      images: Array.isArray(product.images) ? product.images.join(',') : (product.images || "")
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name_en: "",
      name_ro: "",
      slug: "",
      description_en: "",
      description_ro: "",
      short_description_en: "",
      short_description_ro: "",
      price: "",
      category_id: "",
      brand: "",
      sku: "",
      stock_quantity: "",
      images: ""
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormData({
      name_en: "",
      name_ro: "",
      slug: "",
      description_en: "",
      description_ro: "",
      short_description_en: "",
      short_description_ro: "",
      price: "",
      category_id: "",
      brand: "",
      sku: "",
      stock_quantity: "",
      images: ""
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleDelete = async (productId: number) => {
    try {
      await api.deleteProduct(productId);
      fetchData(); // Refresh the list
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const openVariantsModal = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const variantsData = await api.getProductVariants(product.id);
      setVariants(variantsData);
    } catch (error) {
      console.error("Error fetching variants:", error);
      setVariants([]);
    }
    setShowVariantsModal(true);
  };

  const closeVariantsModal = () => {
    setShowVariantsModal(false);
    setSelectedProduct(null);
    setVariants([]);
    setEditingVariant(null);
    setVariantFormData({
      value_en: "",
      value_ro: "",
      price: "",
      stock_quantity: "",
      sku: ""
    });
  };

  const handleVariantInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setVariantFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      const variantData = {
        value_en: variantFormData.value_en,
        value_ro: variantFormData.value_ro,
        price: parseFloat(variantFormData.price) || 0,
        stock_quantity: parseInt(variantFormData.stock_quantity) || 0,
        sku: variantFormData.sku
      };
      
      if (editingVariant) {
        await api.updateProductVariant(editingVariant.id, variantData);
        console.log("Variant updated successfully");
      } else {
        await api.createProductVariant(selectedProduct.id, variantData);
        console.log("Variant created successfully");
      }
      
      // Refresh variants
      const variantsData = await api.getProductVariants(selectedProduct.id);
      setVariants(variantsData);
      
      // Reset form
      setEditingVariant(null);
      setVariantFormData({
        value_en: "",
        value_ro: "",
        price: "",
        stock_quantity: "",
        sku: ""
      });
    } catch (error) {
      console.error("Error saving variant:", error);
      alert("Failed to save variant. Please try again.");
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantFormData({
      value_en: variant.value_en || "",
      value_ro: variant.value_ro || "",
      price: variant.price?.toString() || "",
      stock_quantity: variant.stock_quantity?.toString() || "",
      sku: variant.sku || ""
    });
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      try {
        await api.deleteProductVariant(variantId);
        if (selectedProduct) {
          const variantsData = await api.getProductVariants(selectedProduct.id);
          setVariants(variantsData);
        }
      } catch (error) {
        console.error("Error deleting variant:", error);
        alert("Failed to delete variant. Please try again.");
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name_ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.id === "products" 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          
          {/* Search and Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                <Button onClick={openNewProductModal}>
                  <Plus className="h-4 w-4" />
                  New Product
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'New Product'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Update the product information below.' : 'Create a new product by filling out the form below.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        Price *
                      </label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <Input
                        type="number"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <Input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <Input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                      />
                    </div>
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
                      English Short Description
                    </label>
                    <Input
                      type="text"
                      name="short_description_en"
                      value={formData.short_description_en}
                      onChange={handleInputChange}
                      maxLength={200}
                      placeholder="Brief description (max 200 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Romanian Short Description
                    </label>
                    <Input
                      type="text"
                      name="short_description_ro"
                      value={formData.short_description_ro}
                      onChange={handleInputChange}
                      maxLength={200}
                      placeholder="Brief description (max 200 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images
                    </label>
                    <div className="space-y-3">
                      {/* Image Management */}
                      {(imagePreviews.length > 0 || (formData.images && formData.images.split(',').filter(img => img.trim()).length > 0)) && (
                        <div className="space-y-4">
                          {/* New image uploads */}
                          {imagePreviews.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">New Uploads:</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {imagePreviews.map((preview, index) => (
                                  <div key={`preview-${index}`} className="relative">
                                    <Image 
                                      src={preview} 
                                      alt={`New Upload ${index + 1}`} 
                                      width={96}
                                      height={96}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                                      title="Remove new upload"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Existing images from database */}
                          {formData.images && formData.images.split(',').filter(img => img.trim()).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {formData.images.split(',').filter(img => img.trim()).map((image, index) => (
                                  <div key={`existing-${index}`} className="relative">
                                    <Image 
                                      src={image.trim()} 
                                      alt={`Existing ${index + 1}`} 
                                      width={96}
                                      height={96}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeExistingImage(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                                      title="Remove existing image"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                            multiple
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
                    {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Table */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Products ({products.length})</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No products found</div>
              <p className="text-gray-500 mt-2">Create your first product to get started</p>
            </div>
          ) : (
            <>
              {/* Table Headers */}
              <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-50 rounded-lg mb-4 font-medium text-gray-700">
                <div>ID</div>
                <div>Images</div>
                <div>Name</div>
                <div>Category</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Actions</div>
              </div>

              {/* Products List */}
              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                  <div className="font-medium">{product.id}</div>
                  <div className="flex items-center gap-2">
                    {product.images && product.images.length > 0 ? (
                      <div className="flex gap-1">
                        {product.images.slice(0, 2).map((image, index) => (
                          <div key={index} className="relative">
                            <Image 
                              src={image} 
                              alt={`${product.name_en} ${index + 1}`}
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
                        {product.images.length > 2 && (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                            +{product.images.length - 2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>{product.name_en}</div>
                  <div className="text-sm text-gray-600">
                    {categories.find(c => c.id === product.category_id)?.name_en || 'Unknown'}
                  </div>
                  <div className="font-medium">{product.price} RON</div>
                  <div className="text-sm text-gray-600">{product.stock_quantity}</div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openVariantsModal(product)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="Manage variants"
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(product)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete product"
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

      {/* Variants Modal */}
      <Dialog open={showVariantsModal} onOpenChange={setShowVariantsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Variants - {selectedProduct?.name_en}
            </DialogTitle>
            <DialogDescription>
              Add, edit, and manage product variants for {selectedProduct?.name_en}
            </DialogDescription>
          </DialogHeader>

          {/* Variant Form */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h3>
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Value (EN)
                  </label>
                  <Input
                    type="text"
                    name="value_en"
                    value={variantFormData.value_en}
                    onChange={handleVariantInputChange}
                    placeholder="e.g., Large, Red, Cotton"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Value (RO)
                  </label>
                  <Input
                    type="text"
                    name="value_ro"
                    value={variantFormData.value_ro}
                    onChange={handleVariantInputChange}
                    placeholder="e.g., Mare, Roșu, Bumbac"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={variantFormData.price}
                    onChange={handleVariantInputChange}
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    name="stock_quantity"
                    value={variantFormData.stock_quantity}
                    onChange={handleVariantInputChange}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <Input
                    type="text"
                    name="sku"
                    value={variantFormData.sku}
                    onChange={handleVariantInputChange}
                    placeholder="Optional SKU for this variant"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                {editingVariant ? (
                  <>
                    <Button
                      onClick={handleVariantSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Variant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingVariant(null);
                        setVariantFormData({
                          value_en: "",
                          value_ro: "",
                          price: "",
                          stock_quantity: "",
                          sku: ""
                        });
                      }}
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleVariantSubmit}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add Variant
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Variants List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Current Variants</h3>
            {variants.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No variants added yet</p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {variant.value_en} / {variant.value_ro}
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: {variant.price} RON | 
                        Stock: {variant.stock_quantity} | 
                        SKU: {variant.sku || 'N/A'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVariant(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit variant"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete variant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeVariantsModal}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{productToDelete?.name_en}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDelete(productToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}