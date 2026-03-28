# GetPronto MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that lets AI agents use [Get Pronto](https://www.getpronto.io) image hosting and transformation services natively.

Full documentation can be found in [our docs area](https://www.getpronto.io/docs).

## Quick Start

Add to your Claude Code settings (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "getpronto": {
      "command": "npx",
      "args": ["-y", "getpronto-mcp"],
      "env": {
        "GETPRONTO_API_KEY": "pronto_sk_..."
      }
    }
  }
}
```

Or without a key — the agent will generate an ephemeral test key on demand:

```json
{
  "mcpServers": {
    "getpronto": {
      "command": "npx",
      "args": ["-y", "getpronto-mcp"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `generate_test_key` | Generate an ephemeral API key with limited quotas (no signup required) |
| `upload_image` | Upload from a file path, URL, or data URL |
| `list_files` | List files with pagination and folder filtering |
| `get_file` | Get file details (URL, dimensions, metadata) |
| `delete_file` | Delete a file |
| `transform_image` | Generate a transformed image URL (resize, format, blur, crop, etc.) |

## Ephemeral Test Keys

If no API key is configured, the agent can call `generate_test_key` to get a temporary key instantly — no signup or account needed.

| Limit | Value |
|-------|-------|
| Storage | 100 MB |
| Monthly bandwidth | 500 MB |
| Monthly transforms | 100 |
| Max file size | 10 MB (images only) |
| TTL | 7 days |

After 7 days, the ephemeral account and all its files are automatically deleted.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GETPRONTO_API_KEY` | Your Get Pronto secret API key | None (use `generate_test_key`) |
| `GETPRONTO_BASE_URL` | API base URL | `https://api.getpronto.io/v1` |

## Transform Options

The `transform_image` tool supports:

- **Resize**: `width`, `height`, `fit` (cover, contain, fill, inside, outside)
- **Quality**: 1-100
- **Blur**: Gaussian blur (0.3-1000)
- **Sharpen**: Boolean
- **Grayscale**: Boolean
- **Rotate**: -360 to 360 degrees
- **Format**: jpeg, png, webp, avif
- **Border**: `{ width, color }` (hex color, e.g. `FF0000`)
- **Crop**: `{ x, y, width, height }`

## Related

- [getpronto-sdk](https://www.npmjs.com/package/getpronto-sdk) — JavaScript/TypeScript SDK
- [Get Pronto Docs](https://www.getpronto.io/docs) — Full documentation
- [Get Pronto](https://www.getpronto.io) — Image hosting and transformation SaaS
