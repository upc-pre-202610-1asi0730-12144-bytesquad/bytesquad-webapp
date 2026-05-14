import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://spot-track-apiv1.azurewebsites.net/';

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
