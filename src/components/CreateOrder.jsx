import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, User, Package, IndianRupee, Trash2 } from 'lucide-react';
import { apiService } from '../services/apiService.js';
import { useTheme } from '../context/ThemeContext.jsx';

const CreateOrder = () => {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const addToOrder = (product) => {
    const existingItem = orderItems.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.price_per_unit }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product_id: product.product_id,
        product_name: product.name,
        price_per_unit: product.price_per_unit,
        uom_name: product.uom_name,
        quantity: 1,
        total_price: product.price_per_unit
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromOrder(productId);
      return;
    }

    setOrderItems(orderItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total_price: newQuantity * item.price_per_unit }
        : item
    ));
  };

  const removeFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        customer_name: customerName,
        grand_total: calculateTotal(),
        order_details: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      };

      await apiService.insertOrder(orderData);
      
      // Reset form
      setCustomerName('');
      setOrderItems([]);
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r  from-green-800 via-green-700 to-green-800 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Order</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>Add products to create a customer order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Products List */}
        <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center space-x-2`}>
            <Package className="w-5 h-5" />
            <span>Available Products</span>
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Package className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                    isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} capitalize text-sm sm:text-base`}>
                      {product.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.uom_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600 text-sm sm:text-base">
                      {formatCurrency(product.price_per_unit)}
                    </span>
                    <button
                      onClick={() => addToOrder(product)}
                      className="bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-800 transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center space-x-2`}>
            <ShoppingCart className="w-5 h-5" />
            <span>Order Summary</span>
          </h2>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Customer Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter customer name"
                  required
                />
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Order Items</h3>
              {orderItems.length === 0 ? (
                <div className={`text-center py-4 sm:py-6 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg`}>
                  <ShoppingCart className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-2`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm`}>No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div
                      key={item.product_id}
                      className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 flex items-center justify-between`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-xs sm:text-sm capitalize truncate`}>
                          {item.product_name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatCurrency(item.price_per_unit)} per {item.uom_name}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className={`p-1 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors duration-200`}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        
                        <span className={`w-6 sm:w-8 text-center font-medium text-xs sm:text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className={`p-1 ${isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600'} transition-colors duration-200`}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeFromOrder(item.product_id)}
                          className={`p-1 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors duration-200 ml-1 sm:ml-2`}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            {orderItems.length > 0 && (
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || orderItems.length === 0 || !customerName.trim()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {/* <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" /> */}
              <span>{submitting ? 'Creating Order...' : 'Create Order'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;