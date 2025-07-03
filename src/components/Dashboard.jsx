import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, IndianRupee, Calendar } from 'lucide-react';
import { apiService } from '../services/apiService.js';
import { useTheme } from '../context/ThemeContext.jsx';

const Dashboard = ({ setActiveTab }) => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [products, orders, orderCount, recentOrders] = await Promise.all([
        apiService.getProducts(),
        apiService.getTotalRevenue(),
        apiService.getOrderCount(),
        apiService.getRecentOrders()

      ]);

      const totalRevenue = orders.totalRevenue || 0;
      

      setStats({
        totalProducts: products.length,
        totalOrders: orderCount.order_count,
        totalRevenue,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      color: 'from-purple-500 to-purple-600',
      bgColor: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    // {
    //   title: 'Growth Rate',
    //   value: '+12.5%',
    //   icon: TrendingUp,
    //   color: 'from-orange-500 to-orange-600',
    //   bgColor: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
    //   textColor: 'text-orange-600'
    // }
  ];


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Here's an overview of your grocery store performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm font-medium`}>{stat.title}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-1 truncate`}>{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h2>
          <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <ShoppingCart className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No recent orders found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order.order_id}
                className={`flex items-center justify-between p-3 sm:p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-200`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-900 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      #{order.order_id}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base truncate`}>{order.customer_name}</p>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(order.datetime)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h3>
          <div className="space-y-3">
            <button 
            onClick={() => setActiveTab('products')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base cursor-pointer">
              Add New Product 
            </button>
            <button 
            onClick={() => setActiveTab('create-order')}
            className="w-full bg-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base cursor-pointer">
              Create New Order
            </button>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`}>Database</span>
              <span className="flex items-center text-green-600 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`}>API Server</span>
              <span className="flex items-center text-green-600 text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Running
              </span>
            </div>
            {/* <div className="flex items-center justify-between">
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base`}>Last Backup</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>2 hours ago</span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;