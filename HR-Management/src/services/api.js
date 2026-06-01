import { getApiBaseUrl } from '../config/env.js';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${getApiBaseUrl()}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API request failed');
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Stock Items
  async getAllStock() { return this.request('/stock'); }
  async getStockStats() { return this.request('/stock/stats'); }
  async getStockByCategory(category) { return this.request(`/stock/category/${encodeURIComponent(category)}`); }
  async getStockMonths(category) { return this.request(`/stock/category/${encodeURIComponent(category)}/months`); }
  async getCategoryEntries(category) { return this.request(`/stock/category/${encodeURIComponent(category)}/entries`); }

  async createStockItem(itemData) {
    return this.request('/stock', { method: 'POST', body: JSON.stringify(itemData) });
  }

  async updateStockItem(id, updates) {
    return this.request(`/stock/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  async deleteStockItem(id) {
    return this.request(`/stock/${id}`, { method: 'DELETE' });
  }

  async upsertStockEntry(entryData) {
    return this.request('/stock/entries', { method: 'POST', body: JSON.stringify(entryData) });
  }

  async batchUpsertEntries(entries) {
    return this.request('/stock/entries/batch', { method: 'POST', body: JSON.stringify({ entries }) });
  }

  // Water
  async getWaterDeliveries() { return this.request('/stock/water/deliveries'); }

  // Comments
  async getCategoryComments(category) { return this.request(`/stock/comments/${encodeURIComponent(category)}`); }

  // Documents
  async getAllDocuments() { return this.request('/documents'); }

  // Minutes
  async getAllMinutes() { return this.request('/minutes'); }

  // Leave
  async getAllLeaveRequests() { return this.request('/leave-requests'); }
  async createLeaveRequest(leaveData) { return this.request('/leave-requests', { method: 'POST', body: JSON.stringify(leaveData) }); }
  async updateLeaveStatus(id, statusData) { return this.request(`/leave-requests/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }); }
  async updateLeaveRequest(id, data) { return this.request(`/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteLeaveRequest(id) { return this.request(`/leave-requests/${id}`, { method: 'DELETE' }); }

  // Meetings
  async getAllMeetings() { return this.request('/meetings'); }
  async getMeetingParticipants() { return this.request('/meetings/participants'); }

  // Dashboard & Auth
  async getDashboardStats() { return this.request('/dashboard/stats'); }
  async login(email, password) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
}

export const api = new ApiService();
