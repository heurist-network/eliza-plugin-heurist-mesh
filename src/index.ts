import type { Action, Content, HandlerCallback, Memory, State, IAgentRuntime } from "@elizaos/core";
import { validateEnvironment } from './environment';
import { 
  CoinGeckoTokenInfoAction,
  DexScreenerTokenInfoAction,
  GoplusAnalysisAction
} from './actions';
import { BaseMeshAction } from './actions/base_action';

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

interface RuntimeContext {
  getSetting: (key: string) => string;
  composeState?: (message: Memory, providers: string[]) => Promise<State>;
}

export const heuristMeshPlugin = {
  name: "heurist-mesh",
  description: "Heurist Mesh Agent integration for elizaOS",
  
  // Initialize the plugin
  async initialize(runtime: IAgentRuntime) {
    const env = validateEnvironment(runtime);
    console.log('Heurist Mesh Plugin initialized');
    return env;
  },
  
  // Required empty arrays for the plugin structure
  providers: [],
  evaluators: [],
  services: [],
  
  // Define the plugin's actions
  actions: [
    {
      name: "coinGeckoTokenInfo",
      description: "Get token information from CoinGecko",
      similes: ["getCryptoInfo", "checkTokenPrice", "fetchCoinData"],
      
      validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text?.toLowerCase() || '';
        return (
          text.includes('crypto') || 
          text.includes('token') || 
          text.includes('coin') || 
          text.includes('price') ||
          text.includes('coingecko')
        );
      },
      
      handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state: State, 
        options: any, 
        callback?: HandlerCallback
      ) => {
        try {
          const apiKey = runtime.getSetting("HEURIST_API_KEY");
          if (!apiKey) throw new Error("HEURIST_API_KEY is required");
          
          const coinGeckoAction = new CoinGeckoTokenInfoAction(apiKey);
          const params = options as CoinGeckoParams;
          
          let result;
          let responseText = '';
          
          switch (params.action) {
            case "getTokenInfo":
              if (!params.coingeckoId) throw new Error("coingeckoId is required");
              result = await coinGeckoAction.getTokenInfo(params.coingeckoId);
              responseText = `Here's the token information for ${params.coingeckoId}`;
              break;
            case "getTrendingCoins":
              result = await coinGeckoAction.getTrendingCoins();
              responseText = "Here are the current trending coins";
              break;
            case "getCoingeckoId":
              if (!params.tokenName) throw new Error("tokenName is required");
              result = await coinGeckoAction.getCoingeckoId(params.tokenName);
              responseText = `Found CoinGecko ID for ${params.tokenName}`;
              break;
            default:
              throw new Error(`Unknown action: ${params.action}`);
          }
          
          // Prepare the response
          const responseContent: Content = {
            text: responseText,
            thought: `Executed CoinGecko ${params.action} request. Result: ${JSON.stringify(result)}`,
            actions: ["coinGeckoTokenInfo"]
          };
          
          // Send the response
          if (callback) {
            await callback(responseContent);
          }
          
          return true;
        } catch (error: unknown) {
          console.error("Error in coinGeckoTokenInfo action:", error);
          
          if (callback) {
            await callback({
              text: "I'm sorry, I couldn't retrieve the token information at this time.",
              thought: `Error executing CoinGecko action: ${error instanceof Error ? error.message : 'Unknown error'}`,
              actions: ["REPLY"]
            });
          }
          
          return false;
        }
      },
      
      examples: [
        [
          {
            name: "user1",
            content: { text: "What's the current price of Bitcoin?" }
          },
          {
            name: "assistant",
            content: { 
              text: "Here's the token information for bitcoin",
              thought: "User is asking for Bitcoin price information. I'll use the CoinGecko action to get this data.",
              actions: ["coinGeckoTokenInfo"]
            }
          }
        ]
      ]
    },
    
    {
      name: "dexScreenerTokenInfo",
      description: "Get token information from DexScreener",
      similes: ["checkPairs", "lookupDex", "findTradingPairs"],
      
      validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text?.toLowerCase() || '';
        return (
          text.includes('dex') || 
          text.includes('pair') || 
          text.includes('trading') || 
          text.includes('liquidity') ||
          text.includes('dexscreener')
        );
      },
      
      handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state: State, 
        options: any, 
        callback?: HandlerCallback
      ) => {
        try {
          const apiKey = runtime.getSetting("HEURIST_API_KEY");
          if (!apiKey) throw new Error("HEURIST_API_KEY is required");
          
          const dexScreenerAction = new DexScreenerTokenInfoAction(apiKey);
          const params = options as DexScreenerParams;
          
          let result;
          let responseText = '';
          
          switch (params.action) {
            case "searchPairs":
              if (!params.searchTerm) throw new Error("searchTerm is required");
              result = await dexScreenerAction.searchPairs(params.searchTerm);
              responseText = `Here are the pairs for ${params.searchTerm}`;
              break;
            case "getTokenPairs":
              if (!params.chain || !params.tokenAddress) throw new Error("chain and tokenAddress are required");
              result = await dexScreenerAction.getTokenPairs(params.chain, params.tokenAddress);
              responseText = `Here are the pairs for token ${params.tokenAddress} on ${params.chain}`;
              break;
            default:
              throw new Error(`Unknown action: ${params.action}`);
          }
          
          // Prepare the response
          const responseContent: Content = {
            text: responseText,
            thought: `Executed DexScreener ${params.action} request. Result: ${JSON.stringify(result)}`,
            actions: ["dexScreenerTokenInfo"]
          };
          
          // Send the response
          if (callback) {
            await callback(responseContent);
          }
          
          return true;
        } catch (error: unknown) {
          console.error("Error in dexScreenerTokenInfo action:", error);
          
          if (callback) {
            await callback({
              text: "I'm sorry, I couldn't retrieve the DEX information at this time.",
              thought: `Error executing DexScreener action: ${error instanceof Error ? error.message : 'Unknown error'}`,
              actions: ["REPLY"]
            });
          }
          
          return false;
        }
      },
      
      examples: [
        [
          {
            name: "user1",
            content: { text: "Find trading pairs for USDC on Ethereum" }
          },
          {
            name: "assistant",
            content: { 
              text: "Here are the pairs for token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 on ethereum",
              thought: "User is asking for USDC trading pairs on Ethereum. I'll use DexScreener to look this up.",
              actions: ["dexScreenerTokenInfo"]
            }
          }
        ]
      ]
    },
    
    {
      name: "goplusTokenSecurity",
      description: "Get token security information from GoPlus",
      similes: ["checkTokenSecurity", "scanContract", "verifyTokenSafety"],
      
      validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text?.toLowerCase() || '';
        return (
          text.includes('security') || 
          text.includes('safe') || 
          text.includes('verify') || 
          text.includes('check') ||
          text.includes('scam') ||
          text.includes('goplus')
        );
      },
      
      handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state: State, 
        options: any, 
        callback?: HandlerCallback
      ) => {
        try {
          const apiKey = runtime.getSetting("HEURIST_API_KEY");
          if (!apiKey) throw new Error("HEURIST_API_KEY is required");
          
          const goplusAction = new GoplusAnalysisAction(apiKey);
          const params = options as GoplusParams;
          
          if (!params.contractAddress || !params.chainId) {
            throw new Error("contractAddress and chainId are required");
          }
          
          const result = await goplusAction.fetchSecurityDetails(params.contractAddress, params.chainId);
          
          // Prepare the response
          const responseContent: Content = {
            text: `Here's the security analysis for ${params.contractAddress} on chain ${params.chainId}`,
            thought: `Executed GoPlus security check. Result: ${JSON.stringify(result)}`,
            actions: ["goplusTokenSecurity"]
          };
          
          // Send the response
          if (callback) {
            await callback(responseContent);
          }
          
          return true;
        } catch (error: unknown) {
          console.error("Error in goplusTokenSecurity action:", error);
          
          if (callback) {
            await callback({
              text: "I'm sorry, I couldn't complete the security analysis at this time.",
              thought: `Error executing GoPlus action: ${error instanceof Error ? error.message : 'Unknown error'}`,
              actions: ["REPLY"]
            });
          }
          
          return false;
        }
      },
      
      examples: [
        [
          {
            name: "user1",
            content: { text: "Check if this token is safe: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 on Ethereum" }
          },
          {
            name: "assistant",
            content: { 
              text: "Here's the security analysis for 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 on chain 1",
              thought: "User wants to verify token safety. I'll check the contract using GoPlus.",
              actions: ["goplusTokenSecurity"]
            }
          }
        ]
      ]
    },
    
    {
      name: "queryAgent",
      description: "Send a natural language query to any Heurist Mesh agent",
      similes: ["askMeshAgent", "queryMesh", "talkToAgent"],
      
      validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text?.toLowerCase() || '';
        return (
          text.includes('mesh') || 
          text.includes('agent') || 
          text.includes('ask') || 
          text.includes('query')
        );
      },
      
      handler: async (
        runtime: IAgentRuntime, 
        message: Memory, 
        state: State, 
        options: any, 
        callback?: HandlerCallback
      ) => {
        try {
          const apiKey = runtime.getSetting("HEURIST_API_KEY");
          if (!apiKey) throw new Error("HEURIST_API_KEY is required");
          
          const params = options as QueryAgentParams;
          
          if (!params.agentId || !params.query) {
            throw new Error("agentId and query are required");
          }
          
          const baseAction = new BaseMeshAction(apiKey, params.agentId);
          const result = await baseAction.naturalLanguageQuery(params.query);
          
          // Prepare the response
          const responseContent: Content = {
            text: `Agent ${params.agentId} response: ${result.response || JSON.stringify(result)}`,
            thought: `Queried Mesh agent ${params.agentId} with: "${params.query}". Result: ${JSON.stringify(result)}`,
            actions: ["queryAgent"]
          };
          
          // Send the response
          if (callback) {
            await callback(responseContent);
          }
          
          return true;
        } catch (error: unknown) {
          console.error("Error in queryAgent action:", error);
          
          if (callback) {
            await callback({
              text: "I'm sorry, I couldn't get a response from the agent at this time.",
              thought: `Error executing query agent action: ${error instanceof Error ? error.message : 'Unknown error'}`,
              actions: ["REPLY"]
            });
          }
          
          return false;
        }
      },
      
      examples: [
        [
          {
            name: "user1",
            content: { text: "Ask the blockchain agent about Ethereum gas prices" }
          },
          {
            name: "assistant",
            content: { 
              text: "Agent BlockchainInfoAgent response: The current average gas price on Ethereum is 25 gwei.",
              thought: "User wants information from a specific agent. I'll forward this query to the blockchain agent.",
              actions: ["queryAgent"]
            }
          }
        ]
      ]
    }
  ]
};

export default heuristMeshPlugin; 