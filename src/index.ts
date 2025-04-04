import type { Plugin } from '@elizaos/core';
import type { Action, Content, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { z } from 'zod';
import { BaseMeshAction } from './actions/base_action.ts';
import {
  CoinGeckoTokenInfoAction,
  DexScreenerTokenInfoAction,
  GoplusAnalysisAction,
} from './actions/index.ts';
import type { MeshAgentResponse } from './types';

// Local logger since logger is not exported from @elizaos/core
const logger = {
  info: (message: string, ...args: any[]) => console.info(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
};

/**
 * Defines the configuration schema for the Heurist Mesh plugin
 */
const configSchema = z.object({
  HEURIST_API_KEY: z.string().min(1, 'HEURIST_API_KEY is required'),
});

interface CoinGeckoParams {
  action: 'getTokenInfo' | 'getTrendingCoins' | 'getCoingeckoId';
  tokenName?: string;
  coingeckoId?: string;
}

interface DexScreenerParams {
  action: 'searchPairs' | 'getTokenPairs';
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

/**
 * CoinGecko Token Info Action
 */
const coinGeckoTokenInfoAction: Action = {
  name: 'coinGeckoTokenInfo',
  description: 'Get token information from CoinGecko',
  similes: ['getCryptoInfo', 'checkTokenPrice', 'fetchCoinData'],

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
    callback: HandlerCallback
  ) => {
    try {
      const apiKey = runtime.getSetting('HEURIST_API_KEY');
      if (!apiKey) throw new Error('HEURIST_API_KEY is required');

      const coinGeckoAction = new CoinGeckoTokenInfoAction(apiKey);
      const params = options as CoinGeckoParams;

      let result: MeshAgentResponse | null = null;
      let responseText = '';

      switch (params.action) {
        case 'getTokenInfo':
          if (!params.coingeckoId) throw new Error('coingeckoId is required');
          result = await coinGeckoAction.getTokenInfo(params.coingeckoId);
          responseText = `Here's the token information for ${params.coingeckoId}`;
          break;
        case 'getTrendingCoins':
          result = await coinGeckoAction.getTrendingCoins();
          responseText = 'Here are the current trending coins';
          break;
        case 'getCoingeckoId':
          if (!params.tokenName) throw new Error('tokenName is required');
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
        actions: ['coinGeckoTokenInfo'],
      };

      // Send the response
      await callback(responseContent);

      return responseContent;
    } catch (error) {
      logger.error('Error in coinGeckoTokenInfo action:', error);

      await callback({
        text: "I'm sorry, I couldn't retrieve the token information at this time.",
        thought: `Error executing CoinGecko action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions: ['REPLY'],
      });

      throw error;
    }
  },

  examples: [],
};

/**
 * DexScreener Token Info Action
 */
const dexScreenerTokenInfoAction: Action = {
  name: 'dexScreenerTokenInfo',
  description: 'Get token information from DexScreener',
  similes: ['checkPairs', 'lookupDex', 'findTradingPairs'],

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
    callback: HandlerCallback
  ) => {
    try {
      const apiKey = runtime.getSetting('HEURIST_API_KEY');
      if (!apiKey) throw new Error('HEURIST_API_KEY is required');

      const dexScreenerAction = new DexScreenerTokenInfoAction(apiKey);
      const params = options as DexScreenerParams;

      let result: MeshAgentResponse | null = null;
      let responseText = '';

      switch (params.action) {
        case 'searchPairs':
          if (!params.searchTerm) throw new Error('searchTerm is required');
          result = await dexScreenerAction.searchPairs(params.searchTerm);
          responseText = `Here are the pairs for ${params.searchTerm}`;
          break;
        case 'getTokenPairs':
          if (!params.chain || !params.tokenAddress)
            throw new Error('chain and tokenAddress are required');
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
        actions: ['dexScreenerTokenInfo'],
      };

      // Send the response
      await callback(responseContent);

      return responseContent;
    } catch (error) {
      logger.error('Error in dexScreenerTokenInfo action:', error);

      await callback({
        text: "I'm sorry, I couldn't retrieve the DexScreener information at this time.",
        thought: `Error executing DexScreener action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions: ['REPLY'],
      });

      throw error;
    }
  },

  examples: [],
};

/**
 * GoPlus Token Security Action
 */
const goplusTokenSecurityAction: Action = {
  name: 'goplusTokenSecurity',
  description: 'Get token security information from GoPlus',
  similes: ['checkSecurity', 'scanToken', 'auditContract'],

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || '';
    return (
      text.includes('security') ||
      text.includes('safe') ||
      text.includes('scan') ||
      text.includes('audit') ||
      text.includes('goplus')
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ) => {
    try {
      const apiKey = runtime.getSetting('HEURIST_API_KEY');
      if (!apiKey) throw new Error('HEURIST_API_KEY is required');

      const goplusAction = new GoplusAnalysisAction(apiKey);
      const params = options as GoplusParams;

      if (!params.contractAddress || !params.chainId) {
        throw new Error('contractAddress and chainId are required');
      }

      const result = await goplusAction.fetchSecurityDetails(
        params.contractAddress,
        params.chainId
      );

      // Prepare the response
      const responseContent: Content = {
        text: `Here's the security analysis for ${params.contractAddress} on chain ${params.chainId}`,
        thought: `Executed GoPlus security check. Result: ${JSON.stringify(result)}`,
        actions: ['goplusTokenSecurity'],
      };

      // Send the response
      await callback(responseContent);

      return responseContent;
    } catch (error) {
      logger.error('Error in goplusTokenSecurity action:', error);

      await callback({
        text: "I'm sorry, I couldn't perform the security analysis at this time.",
        thought: `Error executing GoPlus action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions: ['REPLY'],
      });

      throw error;
    }
  },

  examples: [],
};

/**
 * Natural Language Query Action
 */
const queryAgentAction: Action = {
  name: 'queryAgent',
  description: 'Send a natural language query to any Heurist Mesh agent',
  similes: ['askAgent', 'meshQuery', 'naturalLanguageRequest'],

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || '';
    return text.includes('agent') || text.includes('query') || text.includes('mesh');
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ) => {
    try {
      const apiKey = runtime.getSetting('HEURIST_API_KEY');
      if (!apiKey) throw new Error('HEURIST_API_KEY is required');

      const params = options as QueryAgentParams;

      if (!params.agentId || !params.query) {
        throw new Error('agentId and query are required');
      }

      const baseAction = new BaseMeshAction(apiKey, params.agentId);
      const result = await baseAction.naturalLanguageQuery(params.query);

      // Prepare the response
      const responseContent: Content = {
        text: result.response || 'No response from agent',
        thought: `Executed natural language query to ${params.agentId}. Result: ${JSON.stringify(result)}`,
        actions: ['queryAgent'],
      };

      // Send the response
      await callback(responseContent);

      return responseContent;
    } catch (error) {
      logger.error('Error in queryAgent action:', error);

      await callback({
        text: "I'm sorry, I couldn't process your query at this time.",
        thought: `Error executing agent query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions: ['REPLY'],
      });

      throw error;
    }
  },

  examples: [],
};

/**
 * The Heurist Mesh Plugin for elizaOS
 */
export const heuristMeshPlugin: Plugin = {
  name: 'eliza-plugin-heurist-mesh',
  description: 'Heurist Mesh Agent integration for elizaOS',
  config: {
    HEURIST_API_KEY: process.env.HEURIST_API_KEY,
  },
  actions: [
    coinGeckoTokenInfoAction,
    dexScreenerTokenInfoAction,
    goplusTokenSecurityAction,
    queryAgentAction,
  ],
  providers: [],
  services: [],
};

// Export the plugin
export default heuristMeshPlugin;
