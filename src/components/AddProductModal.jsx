import React, { useState, useEffect } from 'react';
import { X, Package, IndianRupee, Scale } from 'lucide-react';
import { apiService } from '../services/apiService.js';
import { useTheme } from '../context/ThemeContext.jsx';

const AddProductModal = ({ onClose, onAdd }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    product_name: '',
    uom_id: '',
    price_per_unit: ''
  });
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUOMs();
  }, []);

  const fetchUOMs = async () => {
    try {
      const data = await apiService.getUOMs();
      setUoms(data);
    } catch (error) {
      console.error('Error fetching UOMs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.uom_id) {
      newErrors.uom_id = 'Unit of measurement is required';
    }

    if (!formData.price_per_unit) {
      newErrors.price_per_unit = 'Price is required';
    } else if (isNaN(formData.price_per_unit) || parseFloat(formData.price_per_unit) <= 0) {
      newErrors.price_per_unit = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r  from-blue-900 via-blue-500 to-blue-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Product</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-200`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Product Name */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Product Name
            </label>
            <div className="relative">
              <Package className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.product_name 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter product name"
              />
            </div>
            {errors.product_name && (
              <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
            )}
          </div>

          {/* Unit of Measurement */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Unit of Measurement
            </label>
            <div className="relative">
              <Scale className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
              <select
                name="uom_id"
                value={formData.uom_id}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200 text-sm sm:text-base ${
                  errors.uom_id 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select unit</option>
                {uoms.map((uom) => (
                  <option key={uom.uom_id} value={uom.uom_id}>
                    {uom.uom_name}
                  </option>
                ))}
              </select>
            </div>
            {errors.uom_id && (
              <p className="mt-1 text-sm text-red-600">{errors.uom_id}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Price per Unit (₹)
            </label>
            <div className="relative">
              <IndianRupee className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
              <input
                type="number"
                name="price_per_unit"
                value={formData.price_per_unit}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.price_per_unit 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price_per_unit && (
              <p className="mt-1 text-sm text-red-600">{errors.price_per_unit}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 border rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;