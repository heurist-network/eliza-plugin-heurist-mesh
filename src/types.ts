export interface MeshAgentResponse {
  response: string;
  data?: any;
  success?: boolean;
}

export interface MeshAgentRequest {
  agent_id: string;
  input: {
    query?: string;
    tool?: string;
    tool_arguments?: Record<string, any>;
    raw_data_only?: boolean;
  };
  api_key: string;
}

export type AgentTools = {
  [key: string]: {
    description: string;
    parameters: Record<string, any>;
  }
};

export interface MeshAgentMetadata {
  name: string;
  description: string;
  inputs: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  outputs: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  external_apis: string[];
  tags: string[];
}

export interface HeuristMeshPluginConfig {
  availableAgents: string[];
} 