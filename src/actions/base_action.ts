import { MeshClient } from '../clients/mesh_client';

export class BaseMeshAction {
  protected client: MeshClient;
  protected agentId: string;

  constructor(apiKey: string, agentId: string) {
    this.client = new MeshClient(apiKey);
    this.agentId = agentId;
  }

  async naturalLanguageQuery(query: string) {
    return this.client.callAgent(this.agentId, query);
  }
}
