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

    this.#http.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const body   = error.response?.data;
        if (status === 403 || status === 400) {
          const serverMessage =
            body?.message || body?.error || body?.title ||
            (typeof body === 'string' ? body : null);
          const defaults = {
            403: 'You do not have permission to perform this action.',
            400: 'The request could not be processed.',
          };
          const enhanced = new Error(serverMessage || defaults[status]);
          enhanced.status   = status;
          enhanced.apiError = body;
          return Promise.reject(enhanced);
        }
        return Promise.reject(error);
      }
    );
  }

  get http() { return this.#http; }
}
