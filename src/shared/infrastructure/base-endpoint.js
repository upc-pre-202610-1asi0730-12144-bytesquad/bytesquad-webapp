export class BaseEndpoint {
  #http;
  #path;
  #assembler;

  constructor(api, endpointPath, assembler) {
    this.#http      = api.http;
    this.#path      = endpointPath;
    this.#assembler = assembler;
  }

  async getAll() {
    const { data } = await this.#http.get(this.#path);
    const list = Array.isArray(data) ? data : (data[Object.keys(data)[0]] ?? []);
    return list.map(r => this.#assembler.toEntityFromResource(r));
  }

  async getById(id) {
    const { data } = await this.#http.get(`${this.#path}/${id}`);
    return this.#assembler.toEntityFromResource(data);
  }

  async create(entity) {
    const resource = this.#assembler.toResourceFromEntity(entity);
    const { data } = await this.#http.post(this.#path, resource);
    return this.#assembler.toEntityFromResource(data);
  }

  async update(id, entity) {
    const resource = this.#assembler.toResourceFromEntity(entity);
    const { data } = await this.#http.put(`${this.#path}/${id}`, resource);
    return this.#assembler.toEntityFromResource(data);
  }

  async delete(id) {
    await this.#http.delete(`${this.#path}/${id}`);
  }
}
