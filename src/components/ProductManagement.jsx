import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Search, Filter } from 'lucide-react';
import { apiService } from '../services/apiService.js';
import AddProductModal from './AddProductModal.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Dialog } from '@headlessui/react';

const ProductManagement = () => {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.uom_name === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const confirmDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setDeleteError('');
  };

  const cancelDeleteProduct = () => {
    setProductToDelete(null);
    setDeleteError('');
  };

  const handleDeleteConfirmed = async () => {
    try {
      await apiService.deleteProduct(productToDelete);
      await fetchProducts();
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteError('Failed to delete product. Please try again.');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await apiService.insertProduct(productData);
      await fetchProducts();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const categories = ['all', ...new Set(products.map(p => p.uom_name))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Product Management</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>Manage your grocery store inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base cursor-pointer ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onClose={cancelDeleteProduct} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm Deletion
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Are you sure you want to delete this product?
          </Dialog.Description>
          {deleteError && <p className="text-red-500 mt-2 text-sm">{deleteError}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={cancelDeleteProduct}
              className="px-3 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              className="px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Products Grid */}
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className={`w-12 h-12 sm:w-16 sm:h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No products found</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 text-sm sm:text-base`}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className={`${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => confirmDeleteProduct(product.product_id)}
                      className={`p-2 text-red-600 hover:${isDark ? 'bg-red-900/20' : 'bg-red-50'} rounded-lg transition-colors duration-200`}
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 capitalize text-sm sm:text-base`}>
                  {product.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price:</span>
                    <span className="font-semibold text-green-600 text-xs sm:text-sm">
                      {formatCurrency(product.price_per_unit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unit:</span>
                    <span className={`text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : ''}`}>
                      {product.uom_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID:</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#{product.product_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;