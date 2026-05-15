import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { ConfigurationAssembler } from './configuration-assembler.js';

export class ConfigurationApi extends BaseApi {
  #assembler;

  constructor() {
    super();
    this.#assembler = new ConfigurationAssembler();
  }

  async getConfiguration() {
    const { data } = await this.http.get('configurations');
    return this.#assembler.toEntityFromResource(data);
  }

  async saveConfiguration(config) {
    const { data } = await this.http.put('configurations', this.#assembler.toResourceFromEntity(config));
    return this.#assembler.toEntityFromResource(data);
  }
}
