const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Stock Management APIs (Read-only for HR)
  async getAllStock() {
    return this.request('/stock');
  }

  async getStockStats() {
    return this.request('/stock/stats');
  }

  async getLowStockItems() {
    return this.request('/stock/low-stock');
  }

  async getStockByCategory(category) {
    return this.request(`/stock/category/${encodeURIComponent(category)}`);
  }

  async getStockById(id) {
    return this.request(`/stock/${id}`);
  }

  async getPurchaseHistory(id) {
    return this.request(`/stock/${id}/purchase-history`);
  }

  // Document Management APIs (Read-only for HR)
  async getAllDocuments() {
    return this.request('/documents');
  }

  async getAllMinutes() {
    return this.request('/minutes');
  }

  // Leave Request APIs
  async getAllLeaveRequests() {
    return this.request('/leave-requests');
  }

  async updateLeaveStatus(id, statusData) {
    return this.request(`/leave-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async getLeaveStats() {
    return this.request('/leave-requests/stats');
  }

  // Meetings APIs (read-only for HR)
  async getAllMeetings() {
    return this.request('/meetings');
  }

  async getMeetingParticipants() {
    return this.request('/meetings/participants');
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export const api = new ApiService();
