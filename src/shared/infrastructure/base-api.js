import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class BaseApi {
  #http;

  constructor() {
    this.#http = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.#http.interceptors.request.use((config) => {
      try {
        const raw = localStorage.getItem('spottrack_session');
        if (raw) {
          const { token } = JSON.parse(raw);
          if (token) config.headers.Authorization = `Bearer ${token}`;
        }
      } catch { /* no session — proceed without auth header */ }
      return config;
    });
  }

  get http() { return this.#http; }
}
