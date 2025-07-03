const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

    const cfg = { ...options };

    // ✅ Safely get token using Clerk frontend (SPA)
    const token = await window.Clerk?.session?.getToken({ template: 'backend' });


    cfg.headers = {
      ...(cfg.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // Add Content-Type if not using FormData
    if (cfg.body && !(cfg.body instanceof FormData)) {
      cfg.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, cfg);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ✅ Products
  async getProducts() {
    return this.request('/getProducts');
  }

  async insertProduct(product) {
    return this.request('/insertProduct', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(productId) {
    return this.request('/deleteProduct', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  // ✅ Orders
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
      body: JSON.stringify(orderData),
    });
  }

  // ✅ UOM (not protected — if public route, no token needed)
  async getUOMs() {
    return this.request('/getUOM');
  }
}

export const apiService = new ApiService();
