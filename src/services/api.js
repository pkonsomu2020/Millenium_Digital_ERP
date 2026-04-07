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

  // Stock Management APIs
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

  async createStockItem(itemData) {
    return this.request('/stock', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateStockItem(id, updates) {
    return this.request(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStockItem(id) {
    return this.request(`/stock/${id}`, {
      method: 'DELETE',
    });
  }

  async addPurchase(id, purchaseData) {
    return this.request(`/stock/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getPurchaseHistory(id) {
    return this.request(`/stock/${id}/purchase-history`);
  }

  async updatePurchaseRecord(purchaseId, data) {
    return this.request(`/stock/purchase/${purchaseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePurchaseRecord(purchaseId) {
    return this.request(`/stock/purchase/${purchaseId}`, {
      method: 'DELETE',
    });
  }

  // Document Management APIs
  async getAllDocuments() {
    return this.request('/documents');
  }

  async uploadDocument(formData) {
    const url = `${API_BASE_URL}/documents`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // Don't set Content-Type, let browser set it with boundary
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDocument(id, data) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async replaceDocument(id, formData) {
    const url = `${API_BASE_URL}/documents/${id}/replace`;
    const response = await fetch(url, { method: 'PUT', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Replace failed');
    return data;
  }

  // Meeting Minutes APIs
  async getAllMinutes() {
    return this.request('/minutes');
  }

  async uploadMinutes(formData) {
    const url = `${API_BASE_URL}/minutes`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  }

  async deleteMinutes(id) {
    return this.request(`/minutes/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMinutes(id, data) {
    return this.request(`/minutes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async replaceMinutes(id, formData) {
    const url = `${API_BASE_URL}/minutes/${id}/replace`;
    const response = await fetch(url, { method: 'PUT', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Replace failed');
    return data;
  }

  // Leave Request APIs
  async getAllLeaveRequests() {
    return this.request('/leave-requests');
  }

  async createLeaveRequest(leaveData) {
    return this.request('/leave-requests', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async updateLeaveStatus(id, statusData) {
    return this.request(`/leave-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async updateLeaveRequest(id, data) {
    return this.request(`/leave-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLeaveRequest(id) {
    return this.request(`/leave-requests/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeaveStats() {
    return this.request('/leave-requests/stats');
  }

  // Meetings APIs
  async getAllMeetings() {
    return this.request('/meetings');
  }

  async getMeetingParticipants() {
    return this.request('/meetings/participants');
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  async updateMeeting(id, meetingData) {
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData),
    });
  }

  async deleteMeeting(id) {
    return this.request(`/meetings/${id}`, {
      method: 'DELETE',
    });
  }

  async sendMeetingReminder(id, data) {
    return this.request(`/meetings/${id}/reminder`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // WOPI / inline text editor
  async getTextContent(id, table = 'documents') {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const wopiBase = API_BASE.replace('/api', '');
    const res = await fetch(`${wopiBase}/wopi/text/${id}?table=${table}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load content');
    return data.content;
  }

  async saveTextContent(id, content, table = 'documents') {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const wopiBase = API_BASE.replace('/api', '');
    const res = await fetch(`${wopiBase}/wopi/text/${id}?table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save content');
    return data;
  }

  getWopiEditUrl(id, table = 'documents') {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const wopiBase = API_BASE.replace('/api', '');
    const wopiSrc = encodeURIComponent(`${wopiBase}/wopi/files/${id}?table=${table}`);
    return `https://office.live.com/op/edit.aspx?WOPISrc=${wopiSrc}`;
  }
}

export const api = new ApiService();
