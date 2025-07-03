const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.retryCount = 2; // Number of retries for failed requests
    this.retryDelay = 1000; // Delay between retries in ms
  }

  async request(endpoint, options = {}, retries = this.retryCount) {
    const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const cfg = { ...options };

    try {
      // Ensure Clerk is properly initialized
      if (window.Clerk && !window.Clerk.session) {
        await window.Clerk.load();
      }

      // Get token only if Clerk is available and user is authenticated
      let token = null;
      if (window.Clerk?.session) {
        token = await window.Clerk.session.getToken({ 
          template: 'backend',
          skipCache: true // Ensures fresh token
        });
        console.debug("🔐 Clerk Token:", token?.slice(0, 20) + "..."); // Log partial token for security
      }

      // Set headers
      cfg.headers = {
        ...(cfg.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      };

      // Handle request body
      if (cfg.body && !(cfg.body instanceof FormData)) {
        cfg.body = JSON.stringify(cfg.body);
      }

      const response = await fetch(url, cfg);

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && retries > 0) {
        console.log('Token might be expired, refreshing...');
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.request(endpoint, options, retries - 1);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Product APIs
  async getProducts() {
    return this.request('/getProducts');
  }

  async insertProduct(product) {
    return this.request('/insertProduct', {
      method: 'POST',
      body: product
    });
  }

  async deleteProduct(productId) {
    return this.request('/deleteProduct', {
      method: 'POST',
      body: { product_id: productId }
    });
  }

  // Order APIs
  async getAllOrders() {
    return this.request('/getAllOrders');
  }

  async getOrderCount() {
    return this.request('/getOrderCount');
  }

  async getRecentOrders() {
    return this.request('/getRecentOrders');
  }

  async getOrderDetails(orderId) {
    return this.request(`/getOrderDetails/${orderId}`);
  }

  async getOrders() {
    return this.request('/getOrders');
  }

  async getTotalRevenue() {
    return this.request('/getTotalRevenue');
  }

  async insertOrder(orderData) {
    return this.request('/insertOrder', {
      method: 'POST',
      body: orderData
    });
  }

  // Unprotected route
  async getUOMs() {
    return this.request('/getUOM');
  }
}

export const apiService = new ApiService();