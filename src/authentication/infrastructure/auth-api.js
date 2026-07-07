import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AuthAssembler } from './auth-assembler.js';

const assembler = new AuthAssembler();

export class AuthApi extends BaseApi {
  async signIn(username, password) {
    const { data } = await this.http.post('authentication/sign-in', { username, password });
    return data; // { id, username, role, token }
  }

  async signUp(username, password) {
    await this.http.post('authentication/sign-up', { username, password });
  }

  async getUsers() {
    const { data } = await this.http.get('users');
    return (Array.isArray(data) ? data : []).map(r => assembler.toEntityFromResource(r));
  }

  async changePassword(currentPassword, newPassword) {
    await this.http.patch('authentication/me/password', { currentPassword, newPassword });
  }
}
