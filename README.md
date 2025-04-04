# Heurist Mesh Plugin for elizaOS

This plugin integrates the Heurist Mesh Agent services into elizaOS, providing access to specialized Web3 tools and blockchain analysis capabilities.

## Development

```bash
# Install dependencies
bun install

# Start development with hot-reloading
bun run dev

# Build the plugin
bun run build

# Generate type definitions
bun run types

# Run code quality checks
bun run check

# Format code
bun run check:write

# Bump version
bun run version:patch  # For patch version
bun run version:minor  # For minor version
bun run version:major  # For major version
```

## Code Quality

This project uses [Biome](https://biomejs.dev/) for code formatting and linting. The configuration can be found in `biome.json`.

## Publishing

Before publishing your plugin to the ElizaOS registry, ensure you meet these requirements:

1. **GitHub Repository**
   - Create a public GitHub repository for this plugin
   - Add the 'elizaos-plugins' topic to the repository
   - Use 'main' as the default branch

2. **Required Assets**
   - Add images to the `images/` directory:
     - `logo.jpg` (400x400px square, <500KB)
     - `banner.jpg` (1280x640px, <1MB)

3. **Publishing Process**
   ```bash
   # Check if your plugin meets all registry requirements
   bunx elizaos plugin publish --test
   
   # Publish to the registry
   bunx elizaos plugin publish
   ```

After publishing, your plugin will be submitted as a pull request to the ElizaOS registry for review.

## Configuration

The `agentConfig` section in `package.json` defines the parameters your plugin requires:

```json
"agentConfig": {
  "pluginType": "elizaos:plugin:1.0.0",
  "pluginParameters": {
    "HEURIST_API_KEY": {
      "type": "string",
      "description": "API key for Heurist Mesh Agent service"
    }
  }
}
```

## Features

- Interact with cryptocurrency market data (CoinGecko)
- Analyze DEX trading pairs (DexScreener)
- Check token contract security (GoPlus)
- Natural language queries to all available Mesh agents
- Advanced blockchain data analysis

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

## License

MIT

## Support

For support, please contact the Heurist Network team or open an issue in the GitHub repository. 