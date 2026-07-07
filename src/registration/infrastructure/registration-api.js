import { BaseApi } from '@/shared/infrastructure/base-api.js';

export class RegistrationApi extends BaseApi {
  async registerBusiness(data) {
    const { data: res } = await this.http.post('register-business', data);
    return res; // { checkoutUrl, pendingRegistrationId }
  }
}
