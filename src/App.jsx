import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { ShoppingCart, Package, Users, TrendingUp, Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard.jsx';
import ProductManagement from './components/ProductManagement.jsx';
import OrderManagement from './components/OrderManagement.jsx';
import CreateOrder from './components/CreateOrder.jsx';
import DebugToken from './components/DebugToken.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';

function AppContent({ activeTab, setActiveTab }) {
  
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'create-order', name: 'Create Order', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab}/>;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'create-order':
        return <CreateOrder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SignedOut>
        <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-blue-50 via-white to-green-50'} flex items-center justify-center p-4`}>
          <div className="max-w-md w-full">
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-6 sm:p-8 text-center relative`}>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="w-16 h-16 bg-gradient-to-r  from-green-800 via-green-700 to-green-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Grocery Store Manager
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8 text-sm sm:text-base`}>
                Manage your grocery store inventory, orders, and customers with ease.
              </p>
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="w-full bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-lg">
                    Sign In to Continue
                  </button>
                </SignInButton>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Secure authentication powered by Clerk
                </p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Mobile Menu Button */}
          {/* <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setActiveTab('menu')}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
            >
              <Package className="w-6 h-6" />
            </button>
          </div> */}

          {/* Sidebar */}
          <div className={`w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg hidden lg:block transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-800 via-green-700 to-green-800 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>GroceryStore</h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Management System</p>
                </div>
              </div>
            </div>

            <nav className="mt-6 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-1 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 text-white shadow-lg'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b px-4 sm:px-6 py-4 transition-colors duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} capitalize truncate`}>
                    {activeTab.replace('-', ' ')}
                  </h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base truncate`}>
                    Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  
                  <div className="hidden sm:block text-right">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 sm:w-10 sm:h-10"
                      }
                    }}
                  />
                </div>
              </div>
            </header>
            {/* 🔍 TEMP: Debug Clerk JWT
      <div className="px-4 py-2">
        <DebugToken />
      </div> */}

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2`}>
                <div className="flex space-x-1 overflow-x-auto">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 text-white'
                            : isDark 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  return (
    <ThemeProvider>
      <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </ThemeProvider>
  );
}

export default App;