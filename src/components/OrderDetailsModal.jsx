import React from 'react';
import { X, User, Calendar, Package, IndianRupee, ShoppingCart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const OrderDetailsModal = ({ order, onClose }) => {
  const { isDark } = useTheme();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-900 via-green-700 to-green-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Details</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order #{order.order_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-200`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Customer Information</h3>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{order.customer_name}</p>
            </div>

            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Date</h3>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(order.datetime)}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`bg-gradient-to-r ${isDark ? 'from-blue-900/20 to-green-900/20' : 'from-blue-50 to-green-50'} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Amount</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-purple-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Items</h3>
              <span className={`${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'} text-xs px-2 py-1 rounded-full`}>
                {order.order_details?.length || 0} items
              </span>
            </div>

            {order.order_details && order.order_details.length > 0 ? (
              <div className="space-y-3">
                {order.order_details.map((item, index) => (
                  <div
                    key={index}
                    className={`${isDark ? 'bg-gray-700/30 border border-gray-600' : 'bg-white border border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} capitalize text-sm sm:text-base`}>
                          {item.product_name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs sm:text-sm text-gray-600">
                          <span className={isDark ? 'text-gray-400' : ''}>Quantity: {item.quantity}</span>
                          <span className={isDark ? 'text-gray-400' : ''}>Unit Price: {formatCurrency(item.price_per_unit)}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-6 sm:py-8 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg`}>
                <Package className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-2`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No items found for this order</p>
              </div>
            )}
          </div>

          {/* Order Status */}
          <div className={`${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} rounded-lg p-4`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-800'} text-sm sm:text-base`}>Order Status: Completed</span>
            </div>
            <p className={`${isDark ? 'text-green-300' : 'text-green-700'} text-xs sm:text-sm mt-1`}>
              This order has been successfully processed and completed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'} p-4 sm:p-6 rounded-b-2xl`}>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-900 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;