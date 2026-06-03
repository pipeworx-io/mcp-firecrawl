interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Firecrawl MCP — wraps the Firecrawl API (firecrawl.dev) for web
 * scraping / crawling / search optimized for LLM consumption.
 *
 * Tools:
 * - scrape: scrape a single URL into clean markdown (JS-rendered)
 * - map: discover all URLs on a website
 * - search: web search with optional page content
 *
 * Dual-key model: _apiKey is OPTIONAL — pass your own Firecrawl key for
 * higher limits, or omit to use the shared Pipeworx platform key. The
 * gateway injects the platform key into _apiKey when the caller omits it.
 *
 * Firecrawl v1 API: POST with JSON body, `Authorization: Bearer ${apiKey}`,
 * `Content-Type: application/json`. Base URL https://api.firecrawl.dev.
 */


const BASE_URL = 'https://api.firecrawl.dev';

const MARKDOWN_LIMIT = 100000;

const tools: McpToolExport['tools'] = [
  {
    name: 'scrape',
    description:
      'Scrape a single URL into clean markdown (JS-rendered, main content only)',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to scrape, e.g. "https://example.com/article"',
        },
        formats: {
          type: 'array',
          items: { type: 'string' },
          description: 'Output formats to return (default ["markdown"]). Options include "markdown", "html", "rawHtml", "links".',
        },
        only_main_content: {
          type: 'boolean',
          description: 'Strip navigation, footers, and boilerplate, returning just the main content (default true).',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own Firecrawl API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'map',
    description: 'Discover all URLs on a website',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The website URL to map, e.g. "https://example.com"',
        },
        search: {
          type: 'string',
          description: 'Optional search term to filter discovered URLs by relevance.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of URLs to return (default 100, max 5000).',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own Firecrawl API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'search',
    description: 'Web search with optional page content',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query, e.g. "best open-source vector databases".',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 5, max 20).',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own Firecrawl API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
      required: ['query'],
    },
  },
];

async function firecrawlPost(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (!apiKey) {
    return { error: 'api_key_required', message: 'No Firecrawl key available.' };
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }
  return (await res.json()) as Record<string, unknown>;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  switch (name) {
    case 'scrape':
      return scrape(args);
    case 'map':
      return map(args);
    case 'search':
      return search(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  // -- tool implementations (closures capture apiKey) ----------------------

  async function scrape(a: Record<string, unknown>) {
    const url = a.url as string;
    const formats = (a.formats as string[] | undefined) ?? ['markdown'];
    const onlyMainContent = (a.only_main_content as boolean | undefined) ?? true;

    const result = await firecrawlPost(apiKey, '/v1/scrape', {
      url,
      formats,
      onlyMainContent,
    });
    if (result.error !== undefined) return result;

    const data = (result.data as Record<string, unknown>) ?? {};
    const markdown = (data.markdown as string | undefined) ?? '';
    const metadata = (data.metadata as Record<string, unknown> | undefined) ?? {};

    return {
      url,
      markdown: markdown.slice(0, MARKDOWN_LIMIT),
      title: metadata.title,
      description: metadata.description,
      truncated: markdown.length > MARKDOWN_LIMIT,
    };
  }

  async function map(a: Record<string, unknown>) {
    const url = a.url as string;
    const searchTerm = a.search as string | undefined;
    const limit = Math.min(5000, (a.limit as number | undefined) ?? 100);

    const result = await firecrawlPost(apiKey, '/v1/map', {
      url,
      ...(searchTerm ? { search: searchTerm } : {}),
      limit,
    });
    if (result.error !== undefined) return result;

    const links = (result.links as string[] | undefined) ?? [];
    return { url, count: links.length, links };
  }

  async function search(a: Record<string, unknown>) {
    const query = a.query as string;
    const limit = Math.min(20, (a.limit as number | undefined) ?? 5);

    const result = await firecrawlPost(apiKey, '/v1/search', { query, limit });
    if (result.error !== undefined) return result;

    const data = (result.data as Array<Record<string, unknown>> | undefined) ?? [];
    return {
      query,
      results: data.map((r) => ({
        url: r.url,
        title: r.title,
        description: r.description,
      })),
    };
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
