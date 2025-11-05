const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3001/api';

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async createGame() {
    return this.request('/game/create', {
      method: 'POST'
    });
  },

  async joinGame(gameCode) {
    return this.request(`/game/join/${gameCode}`, {
      method: 'POST'
    });
  },

  async checkGame(gameCode) {
    return this.request(`/game/check/${gameCode}`);
  },

  async getOpponent() {
    return this.request(`/game/selected`);
  },

  async sendSelected(selected) {
    return this.request(`/game/selected/${selected}`, {
      method: 'PUT'
    });
  },

  async restart() {
    return this.request(`/game/selected`, {
      method: 'DELETE'
    });
  }
};

export default api;
