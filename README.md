# mcp-firecrawl

Firecrawl MCP — wraps the Firecrawl API (firecrawl.dev) for web

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 737+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `map` | Discover all URLs on a website |
| `search` | Web search with optional page content |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "firecrawl": {
      "url": "https://gateway.pipeworx.io/firecrawl/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 737+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Firecrawl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
