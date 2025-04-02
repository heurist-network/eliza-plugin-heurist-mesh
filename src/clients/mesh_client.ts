import axios from 'axios';
import { MeshAgentRequest, MeshAgentResponse, MeshAgentMetadata } from '../types';

export class MeshClient {
  private baseUrl: string = 'https://sequencer-v2.heurist.xyz';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async callAgent(agentId: string, query: string): Promise<MeshAgentResponse> {
    const request: MeshAgentRequest = {
      agent_id: agentId,
      input: {
        query: query
      },
      api_key: this.apiKey
    };

    try {
      const response = await axios.post(`${this.baseUrl}/mesh_request`, request);
      return response.data;
    } catch (error) {
      console.error(`Error calling Mesh Agent ${agentId}:`, error);
      throw new Error(`Failed to call Mesh Agent: ${error.message}`);
    }
  }

  async callAgentTool(agentId: string, tool: string, args: Record<string, any>): Promise<MeshAgentResponse> {
    const request: MeshAgentRequest = {
      agent_id: agentId,
      input: {
        tool: tool,
        tool_arguments: args,
        raw_data_only: true
      },
      api_key: this.apiKey
    };

    try {
      const response = await axios.post(`${this.baseUrl}/mesh_request`, request);
      return response.data;
    } catch (error) {
      console.error(`Error calling Mesh Agent tool ${agentId}.${tool}:`, error);
      throw new Error(`Failed to call Mesh Agent tool: ${error.message}`);
    }
  }

  async getAgentMetadata(agentId: string): Promise<MeshAgentMetadata> {
    try {
      const response = await axios.get(`${this.baseUrl}/mesh_agents_metadata.json`);
      const metadata = response.data;
      
      if (!metadata[agentId]) {
        throw new Error(`Agent ${agentId} not found in metadata`);
      }
      
      return metadata[agentId];
    } catch (error) {
      console.error(`Error fetching agent metadata for ${agentId}:`, error);
      throw new Error(`Failed to fetch agent metadata: ${error.message}`);
    }
  }
} 