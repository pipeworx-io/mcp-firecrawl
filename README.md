# mcp-firecrawl

Firecrawl MCP — wraps the Firecrawl API (firecrawl.dev) for web

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `scrape` | Scrape a single URL using Firecrawl's JS-rendering engine and return clean markdown (up to 100,000 chars), page title, and description. Strips navigation/boilerplate by default (only_main_content=true). Supports output formats: markdown, html, rawHtml, links. |
| `map` | Crawl a website and return all discovered URLs (up to 5,000). Optionally filter by a search term to rank discovered links by relevance. Returns {url, count, links[]}. |
| `search` | Run a web search via Firecrawl and return ranked results with URL, title, and description snippet. Takes a query string and optional limit (default 5, max 20). Returns {query, results[{url, title, description}]}. |

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
