const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('gostudio_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(name, email, password, role = 'user') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Module 2: Prompt Understanding
  async understandPrompt(prompt) {
    const res = await fetch(`${API_BASE}/agent/understand`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Prompt analysis failed');
    return res.json();
  },

  // Module 3: Agent Execution
  async executeAgent(payload) {
    const res = await fetch(`${API_BASE}/agent/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Agent execution failed');
    }
    return res.json();
  },

  // Module 4: Image Generation
  async generateImage(payload) {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  },

  // Module 5: Editing
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('gostudio_token');
    const res = await fetch(`${API_BASE}/edit/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async removeBackground(image_url, tolerance = 30, edge_blur = 2) {
    const res = await fetch(`${API_BASE}/edit/remove-bg`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image_url, tolerance, edge_blur })
    });
    if (!res.ok) throw new Error('Background removal failed');
    return res.json();
  },

  async replaceBackground(image_url, preset_name) {
    const res = await fetch(`${API_BASE}/edit/replace-bg`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image_url, preset_name })
    });
    if (!res.ok) throw new Error('Background replacement failed');
    return res.json();
  },

  async adjustImage(payload) {
    const res = await fetch(`${API_BASE}/edit/adjust`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Adjustments failed');
    return res.json();
  },

  async applyOverlay(payload) {
    const res = await fetch(`${API_BASE}/edit/overlay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Overlay failed');
    return res.json();
  },

  // Module 6: Models & Arena
  async getModels() {
    const res = await fetch(`${API_BASE}/models`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async compareModels(payload) {
    const res = await fetch(`${API_BASE}/models/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Model comparison failed');
    return res.json();
  },

  // Module 7: Templates
  async getTemplates() {
    const res = await fetch(`${API_BASE}/templates`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async useTemplate(payload) {
    const res = await fetch(`${API_BASE}/templates/use`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Template rendering failed');
    return res.json();
  },

  // Module 8: Media & Projects
  async getMedia(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/media?${qs}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async toggleFavorite(mediaId) {
    const res = await fetch(`${API_BASE}/media/${mediaId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteMedia(mediaId) {
    const res = await fetch(`${API_BASE}/media/${mediaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createProject(project_name, description = '') {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ project_name, description })
    });
    return res.json();
  },

  // Module 10: Admin Analytics
  async getAnalyticsOverview() {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Analytics failed');
    return res.json();
  }
};
