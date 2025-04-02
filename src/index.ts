import { validateEnvironment } from './environment';
import { 
  CoinGeckoTokenInfoAction,
  DexScreenerTokenInfoAction,
  GoplusAnalysisAction
} from './actions';
import { BaseMeshAction } from './actions/base_action';

interface Runtime {
  getSetting: (key: string) => string;
}

interface ActionContext {
  getSetting: (key: string) => string;
}

interface CoinGeckoParams {
  action: "getTokenInfo" | "getTrendingCoins" | "getCoingeckoId";
  tokenName?: string;
  coingeckoId?: string;
}

interface DexScreenerParams {
  action: "searchPairs" | "getTokenPairs";
  searchTerm?: string;
  chain?: string;
  tokenAddress?: string;
}

interface GoplusParams {
  contractAddress: string;
  chainId: string;
}

interface QueryAgentParams {
  agentId: string;
  query: string;
}

export const heuristMeshPlugin = {
  name: "heurist-mesh",
  description: "Heurist Mesh Agent integration for elizaOS",
  
  // Initialize the plugin
  async initialize(runtime: Runtime) {
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
      execute: async ({ action, tokenName, coingeckoId }: CoinGeckoParams, { getSetting }: ActionContext) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const coinGeckoAction = new CoinGeckoTokenInfoAction(apiKey);
        
        switch (action) {
          case "getTokenInfo":
            return await coinGeckoAction.getTokenInfo(coingeckoId!);
          case "getTrendingCoins":
            return await coinGeckoAction.getTrendingCoins();
          case "getCoingeckoId":
            return await coinGeckoAction.getCoingeckoId(tokenName!);
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
      execute: async ({ action, searchTerm, chain, tokenAddress }: DexScreenerParams, { getSetting }: ActionContext) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const dexScreenerAction = new DexScreenerTokenInfoAction(apiKey);
        
        switch (action) {
          case "searchPairs":
            return await dexScreenerAction.searchPairs(searchTerm!);
          case "getTokenPairs":
            return await dexScreenerAction.getTokenPairs(chain!, tokenAddress!);
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
      execute: async ({ contractAddress, chainId }: GoplusParams, { getSetting }: ActionContext) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const goplusAction = new GoplusAnalysisAction(apiKey);
        
        return await goplusAction.fetchSecurityDetails(contractAddress, chainId);
      }
    },
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
      execute: async ({ agentId, query }: QueryAgentParams, { getSetting }: ActionContext) => {
        const apiKey = getSetting("HEURIST_API_KEY");
        const baseAction = new BaseMeshAction(apiKey, agentId);
        
        return await baseAction.naturalLanguageQuery(query);
      }
    }
  ]
};

// Export the plugin
export default heuristMeshPlugin; 