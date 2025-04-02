# Heurist Mesh Plugin for elizaOS

This plugin integrates the Heurist Mesh Agent services into elizaOS, providing access to specialized Web3 tools and blockchain analysis capabilities.

## Features

- Interact with cryptocurrency market data (CoinGecko)
- Analyze DEX trading pairs (DexScreener)
- Check token contract security (GoPlus)
- Natural language queries to all available Mesh agents
- Advanced blockchain data analysis

## Installation

1. Install the plugin in your elizaOS environment:
```bash
npm install @elizaos/eliza-plugin-heurist-mesh
```

2. Configure your Heurist API key in elizaOS settings:
```json
{
  "HEURIST_API_KEY": "your-api-key-here"
}
```

## Available Actions

### CoinGecko Token Info

Get cryptocurrency market data and token information:

```typescript
// Get token info by CoinGecko ID
await eliza.execute("coinGeckoTokenInfo", {
  action: "getTokenInfo",
  coingeckoId: "bitcoin"
});

// Get trending coins
await eliza.execute("coinGeckoTokenInfo", {
  action: "getTrendingCoins"
});

// Search for a token's CoinGecko ID
await eliza.execute("coinGeckoTokenInfo", {
  action: "getCoingeckoId",
  tokenName: "Bitcoin"
});
```

### DexScreener Token Info

Get DEX trading pair information:

```typescript
// Search for trading pairs
await eliza.execute("dexScreenerTokenInfo", {
  action: "searchPairs",
  searchTerm: "USDC"
});

// Get all pairs for a token
await eliza.execute("dexScreenerTokenInfo", {
  action: "getTokenPairs",
  chain: "ethereum",
  tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
});
```

### GoPlus Token Security

Analyze token contract security:

```typescript
await eliza.execute("goplusTokenSecurity", {
  contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chainId: "1" // Ethereum mainnet
});
```

### Natural Language Query

Query any Heurist Mesh agent with natural language:

```typescript
await eliza.execute("queryAgent", {
  agentId: "CoinGeckoTokenInfoAgent",
  query: "What is the current price of Bitcoin?"
});
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/eliza-plugin-heurist-mesh.git
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For support, please contact the Heurist Network team or open an issue in the GitHub repository. 