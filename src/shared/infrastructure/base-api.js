import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class BaseApi {
  #http;

  constructor() {
    this.#http = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  get http() { return this.#http; }
}
