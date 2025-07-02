import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Calendar, User, IndianRupee, Package } from 'lucide-react';
import { apiService } from '../services/apiService.js';
import OrderDetailsModal from './OrderDetailsModal.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const OrderManagement = () => {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [data, orderCount] = await Promise.all([
        apiService.getOrders(),
        apiService.getOrderCount()
      ]);
      setOrders(data);
      setOrderCount(orderCount.order_count);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      const details = await apiService.getOrderDetails(order.order_id);
      setSelectedOrder({ ...order, order_details: details });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Management</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>View and manage all customer orders</p>
          </div>
          <div className="bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 text-white px-3 sm:px-4 py-2 rounded-lg text-center">
            <span className="font-semibold text-sm sm:text-base">{orderCount} Total Orders</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ShoppingCart className={`w-12 h-12 sm:w-16 sm:h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No orders found</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className={`hidden md:block ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} px-4 sm:px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-6 gap-4 font-semibold text-xs sm:text-sm text-gray-700">
                <div className={isDark ? 'text-gray-300' : ''}>Order ID</div>
                <div className={isDark ? 'text-gray-300' : ''}>Customer</div>
                <div className={isDark ? 'text-gray-300' : ''}>Date & Time</div>
                <div className={isDark ? 'text-gray-300' : ''}>No. of Items</div>
                <div className={isDark ? 'text-gray-300' : ''}>Total</div>
                <div className={isDark ? 'text-gray-300' : ''}>Actions</div>
              </div>
            </div>

            {/* Orders List */}
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className={`px-4 sm:px-6 py-4 hover:${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} transition-colors duration-200`}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-900 via-green-700 to-green-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">#{order.order_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium text-sm sm:text-base`}>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>
                        {formatDate(order.datetime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                        {order.item_count || 0} items
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <IndianRupee className="w-4 h-4 text-gray-400" /> */}
                      <span className="font-bold text-green-600 text-sm sm:text-base">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">#{order.order_id}</span>
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm`}>{order.customer_name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(order.datetime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">{formatCurrency(order.total)}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{order.item_count || 0} items</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderManagement;
