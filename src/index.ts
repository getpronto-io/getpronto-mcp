import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { setApiKey, setBaseUrl } from "./state";
import { toolDefinitions, handleToolCall } from "./tools";

const server = new Server(
  {
    name: "getpronto-mcp",
    version: "1.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    const result = await handleToolCall(name, args);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Initialize from env vars
const apiKey = process.env.GETPRONTO_API_KEY;
const baseUrl = process.env.GETPRONTO_BASE_URL;

if (baseUrl) {
  setBaseUrl(baseUrl);
}

if (apiKey) {
  setApiKey(apiKey, baseUrl);
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
