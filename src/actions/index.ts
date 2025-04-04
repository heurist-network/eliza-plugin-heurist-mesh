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
      token_address: tokenAddress,
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
      chain_id: chainId,
    });
  }
}
