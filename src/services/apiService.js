const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const cfg = {...options};

    if (options.body) {
      cfg.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }

    const response = await fetch(url, cfg);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
    
  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         ...options.headers,
  //       },
  //       ...options,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error(`API request failed for ${endpoint}:`, error);
  //     throw error;
  //   }
  // }

  // Products
  async getProducts() {
    return this.request('/getProducts');
  }

  // async insertProduct(productData) {
  //   const formData = neaw FormData();
  //   formData.append('data', JSON.stringify(productData));
    
  //   const response = await fetch(`${API_BASE_URL}/insertProduct`, {
  //     method: 'POST',
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   return response.json();
  // }

  async insertProduct(product) {
  return this.request('/insertProduct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

  async deleteProduct(productId) {
    const formData = new FormData();
    formData.append('product_id', productId.toString());
    
    const response = await fetch(`${API_BASE_URL}/deleteProduct`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Orders
  async getAllOrders() {
    return this.request('/getAllOrders');
  }

  async getOrderCount() {
  return this.request('/getOrderCount');
  }

  async getRecentOrders() {
  return this.request('/getRecentOrders');
  }

  getOrderDetails(orderId) {
  return this.request(`/getOrderDetails/${orderId}`);
  }

  async getOrders() {
  return this.request('/getOrders');
  }

  async insertOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/insertOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}


  // UOM (Units of Measurement)
  async getUOMs() {
    return this.request('/getUOM');
  }
}

export const apiService = new ApiService();