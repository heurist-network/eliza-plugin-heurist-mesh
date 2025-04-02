# Creating a Heurist Mesh Agent Plugin for elizaOS

## Introduction
Now I want to create a heurist-mesh-agent plugin for elizaOS via elizaOS plugin-registry.
* The related github is * https://github.com/elizaos-plugins/registry for elizaOS plugin-registry * 
* example of another project that build mcp server plugin https://github.com/elizaos-plugins/registry/pull/112 * *
* *the main elizaos repo to integrate with https://github.com/elizaOS/eliza * 
* our heurist mesh agent in this repo https://github.com/heurist-network/heurist-agent-framework/tree/main/mesh, that can be access via https://sequencer-v2.heurist.xyz/mesh_request with two modes: (1) Natural Language Mode and Direct Tool Mode

Below is the guide provides step-by-step instructions for integrating the Heurist Mesh Agent services with the elizaOS plugin registry.

## Step 1: Set Up Your Project Structure

First, create a new repository following the elizaOS plugin structure:

```
eliza-plugin-heurist-mesh/
├── images/
│   ├── logo.jpg        # Plugin branding logo (400x400px)
│   ├── banner.jpg      # Plugin banner image (1280x640px)
├── src/
│   ├── index.ts        # Main plugin entry point
│   ├── actions/        # Plugin-specific actions
│   ├── clients/        # Client implementations
│   ├── adapters/       # Adapter implementations
│   └── types.ts        # Type definitions
│   └── environment.ts  # runtime.getSetting, zod validation
├── package.json        # Plugin dependencies
└── README.md          # Plugin documentation
```

## Step 2: Create the Package.json Configuration

Create a `package.json` file with the following structure:

```json
{
  "name": "@elizaos/eliza-plugin-heurist-mesh",
  "version": "1.0.0",
  "description": "Heurist Mesh Agent integration for elizaOS",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "agentConfig": {
    "pluginType": "elizaos:plugin:1.0.0",
    "pluginParameters": {
      "HEURIST_API_KEY": {
        "type": "string",
        "description": "API key for Heurist Mesh Agent service"
      }
    }
  },
  "keywords": [
    "elizaos-plugins",
    "ai",
    "crypto",
    "blockchain",
    "agent"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.2",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@types/node": "^18.11.9",
    "typescript": "^5.0.4",
    "jest": "^29.5.0",
    "@types/jest": "^29.5.1"
  }
}
```

## Step 3: Create the Environment Configuration

Create an `environment.ts` file to manage the API key and other settings:

```typescript
import { z } from 'zod';

export const EnvironmentSchema = z.object({
  HEURIST_API_KEY: z.string().min(1, 'HEURIST_API_KEY is required')
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const validateEnvironment = (runtime: any): Environment => {
  const apiKey = runtime.getSetting('HEURIST_API_KEY');
  
  try {
    return EnvironmentSchema.parse({
      HEURIST_API_KEY: apiKey
    });
  } catch (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
};
```

## Step 4: Create Types for Mesh Agents

Create a `types.ts` file to define the Heurist Mesh Agent types:

```typescript
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
```

## Step 5: Create the Mesh Agent Client

Create a file `clients/mesh_client.ts`:

```typescript
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
```

## Step 6: Create Actions for Mesh Agents

Create an actions folder and add some example actions for popular Mesh agents.

First, create a base action file `actions/base_action.ts`:

```typescript
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
```

Next, create specific actions for individual agents in `actions/index.ts`:

```typescript
import { BaseMeshAction } from './base_action';

export class CoinGeckoTokenInfoAction extends BaseMeshAction {
  constructor(apiKey: string) {
    super(apiKey, 'CoinGeckoTokenInfoAgent');
  }

  async getTokenInfo(coingeckoId: string) {
    return this.client.callAgentTool(this.agentId, 'get_token_info', { coingecko_id: coingeckoId });
  }

  async getTrendingCoins() {
    return this.client.callAgentTool(this.agentId, 'get_trending_coins', {});
  }

  async getCoingeckoId(tokenName: string) {
    return this.client.callAgentTool(this.agentId, 'get_coingecko_id', { token_name: tokenName });
  }
}

export class DexScreenerTokenInfoAction extends BaseMeshAction {
  constructor(apiKey: string) {
    super(apiKey, 'DexScreenerTokenInfoAgent');
  }

  async searchPairs(searchTerm: string) {
    return this.client.callAgentTool(this.agentId, 'search_pairs', { search_term: searchTerm });
  }

  async getTokenPairs(chain: string, tokenAddress: string) {
    return this.client.callAgentTool(this.agentId, 'get_token_pairs', { 
      chain: chain, 
      token_address: tokenAddress 
    });
  }
}

export class GoplusAnalysisAction extends BaseMeshAction {
  constructor(apiKey: string) {
    super(apiKey, 'GoplusAnalysisAgent');
  }

  async fetchSecurityDetails(contractAddress: string, chainId: string | number) {
    return this.client.callAgentTool(this.agentId, 'fetch_security_details', {
      contract_address: contractAddress,
      chain_id: chainId
    });
  }
}

// Add more agent actions as needed
```

## Step 7: Create the Main Plugin Entry Point

Create the main plugin file `index.ts`:

```typescript
import { validateEnvironment } from './environment';
import { 
  CoinGeckoTokenInfoAction,
  DexScreenerTokenInfoAction,
  GoplusAnalysisAction
} from './actions';
import { BaseMeshAction } from './actions/base_action';

export const heuristMeshPlugin = {
  name: "heurist-mesh",
  description: "Heurist Mesh Agent integration for elizaOS",
  
  // Initialize the plugin
  async initialize(runtime) {
    const env = validateEnvironment(runtime);
    console.log('Heurist Mesh Plugin initialized');
    return env;
  },
  
  // Define the plugin's actions
  actions: [
    {
      name: "coinGeckoTokenInfo",
      description: "Get token information from CoinGecko",
      parameters: {
        action: {
          type: "string",
          enum: ["getTokenInfo", "getTrendingCoins", "getCoingeckoId"],
          description: "The action to perform"
        },
        tokenName: {
          type: "string",
          description: "Token name for getCoingeckoId action"
        },
        coingeckoId: {
          type: "string",
          description: "CoinGecko ID for getTokenInfo action"
        }
      },
      execute: async ({ action, tokenName, coingeckoId }, { getSetting }) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const coinGeckoAction = new CoinGeckoTokenInfoAction(apiKey);
        
        switch (action) {
          case "getTokenInfo":
            return await coinGeckoAction.getTokenInfo(coingeckoId);
          case "getTrendingCoins":
            return await coinGeckoAction.getTrendingCoins();
          case "getCoingeckoId":
            return await coinGeckoAction.getCoingeckoId(tokenName);
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      }
    },
    {
      name: "dexScreenerTokenInfo",
      description: "Get token information from DexScreener",
      parameters: {
        action: {
          type: "string",
          enum: ["searchPairs", "getTokenPairs"],
          description: "The action to perform"
        },
        searchTerm: {
          type: "string",
          description: "Search term for searchPairs action"
        },
        chain: {
          type: "string",
          description: "Chain identifier for getTokenPairs action"
        },
        tokenAddress: {
          type: "string",
          description: "Token address for getTokenPairs action"
        }
      },
      execute: async ({ action, searchTerm, chain, tokenAddress }, { getSetting }) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const dexScreenerAction = new DexScreenerTokenInfoAction(apiKey);
        
        switch (action) {
          case "searchPairs":
            return await dexScreenerAction.searchPairs(searchTerm);
          case "getTokenPairs":
            return await dexScreenerAction.getTokenPairs(chain, tokenAddress);
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      }
    },
    {
      name: "goplusTokenSecurity",
      description: "Get token security information from GoPlus",
      parameters: {
        contractAddress: {
          type: "string",
          description: "Token contract address"
        },
        chainId: {
          type: "string",
          description: "Chain ID or identifier"
        }
      },
      execute: async ({ contractAddress, chainId }, { getSetting }) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const goplusAction = new GoplusAnalysisAction(apiKey);
        
        return await goplusAction.fetchSecurityDetails(contractAddress, chainId);
      }
    },
    // Natural language query action for any agent
    {
      name: "queryAgent",
      description: "Send a natural language query to any Heurist Mesh agent",
      parameters: {
        agentId: {
          type: "string",
          description: "The ID of the agent to query"
        },
        query: {
          type: "string",
          description: "The natural language query to send"
        }
      },
      execute: async ({ agentId, query }, { getSetting }) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const baseAction = new BaseMeshAction(apiKey, agentId);
        
        return await baseAction.naturalLanguageQuery(query);
      }
    }
  ]
};

// Export the plugin
export default heuristMeshPlugin;
```

## Step 8: Create README.md with Documentation

Create a detailed README.md file with comprehensive instructions:

```markdown
# Heurist Mesh Plugin for elizaOS

This plugin integrates the Heurist Mesh Agent services into elizaOS, providing access to specialized Web3 tools and blockchain analysis capabilities.

## Features

- Interact with cryptocurrency market data (CoinGecko)
- Analyze DEX trading pairs (DexScreener)
- Check token contract security (GoPlus)
- Natural language queries to all available Mesh agents
- Advanced blockchain data analysis


## Available Actions

### CoinGecko Token Info

Get cryptocurrency market data and token information:

- `getTokenInfo`: Get detailed token information using CoinGecko ID
- `getTrendingCoins`: Get the current top trending cryptocurrencies
- `getCoingeckoId`: Search for a token by name to get its CoinGecko ID

### DexScreener Token Info

Get DEX trading pair information:

- `searchPairs`: Search for trading pairs by token name, symbol, or address
- `getTokenPairs`: Get all trading pairs for a specific token address on a chain

### GoPlus Token Security

Analyze token contract security:

- `fetchSecurityDetails`: Get security analysis for a token contract

### Natural Language Query

Query any Heurist Mesh agent with natural language:

- `queryAgent`: Send a free-form query to any available Mesh agent


## License

MIT
```

## Step 9: Add Required Images

Prepare the required branding images in the `images` directory:
- `logo.jpg` (400x400px)
- `banner.jpg` (1280x640px)

Ensure the images follow elizaOS brand guidelines and are optimized for size.


## Key Integration Points

The integration focuses on:

1. Creating a client that calls the Heurist Mesh API endpoints at https://sequencer-v2.heurist.xyz/mesh_request
2. Exposing the Mesh agents as elizaOS actions with strongly-typed parameters
3. Supporting both natural language queries and direct tool access
4. Managing API keys securely through the elizaOS settings system
