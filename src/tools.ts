import { setApiKey, getClient, getBaseUrl } from "./state";

export const toolDefinitions = [
  {
    name: "generate_test_key",
    description:
      "Generate an ephemeral API key for testing Get Pronto. The key expires after 7 days with limited quotas (100MB storage, 500MB bandwidth, 100 transforms, 10MB max file size). No signup required.",
    inputSchema: {
      type: "object" as const,
      properties: {
        baseUrl: {
          type: "string",
          description:
            "Base URL for the Get Pronto API. Defaults to https://api.getpronto.io/v1",
        },
      },
    },
  },
  {
    name: "upload_image",
    description:
      "Upload an image to Get Pronto. Accepts a local file path, URL, or data URL as the source.",
    inputSchema: {
      type: "object" as const,
      properties: {
        source: {
          type: "string",
          description:
            "File path, URL, or data URL of the image to upload",
        },
        filename: {
          type: "string",
          description: "Custom filename for the uploaded image",
        },
        folder: {
          type: "string",
          description: "Folder name to organize the upload into",
        },
      },
      required: ["source"],
    },
  },
  {
    name: "list_files",
    description:
      "List files in your Get Pronto account. Returns paginated results.",
    inputSchema: {
      type: "object" as const,
      properties: {
        page: { type: "number", description: "Page number (default: 1)" },
        pageSize: {
          type: "number",
          description: "Number of files per page (default: 20)",
        },
        folder: {
          type: "string",
          description: "Filter by folder name",
        },
      },
    },
  },
  {
    name: "get_file",
    description:
      "Get details about a specific file including its URL, dimensions, and metadata.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: { type: "string", description: "The file ID to retrieve" },
      },
      required: ["fileId"],
    },
  },
  {
    name: "delete_file",
    description: "Delete a file from Get Pronto.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: { type: "string", description: "The file ID to delete" },
      },
      required: ["fileId"],
    },
  },
  {
    name: "transform_image",
    description:
      "Generate a URL for a transformed version of an image. Supports resize, format conversion, blur, sharpen, grayscale, rotate, border, and crop.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The file ID of the image to transform",
        },
        width: { type: "number", description: "Target width in pixels (1-5000)" },
        height: {
          type: "number",
          description: "Target height in pixels (1-5000)",
        },
        fit: {
          type: "string",
          enum: ["cover", "contain", "fill", "inside", "outside"],
          description: "How the image should fit the dimensions (default: cover)",
        },
        quality: {
          type: "number",
          description: "Output quality 1-100",
        },
        blur: {
          type: "number",
          description: "Gaussian blur radius (0.3-1000)",
        },
        sharpen: {
          type: "boolean",
          description: "Apply sharpening",
        },
        grayscale: {
          type: "boolean",
          description: "Convert to grayscale",
        },
        rotate: {
          type: "number",
          description: "Rotation angle in degrees (-360 to 360)",
        },
        format: {
          type: "string",
          enum: ["jpeg", "jpg", "png", "webp", "avif"],
          description: "Output format",
        },
        border: {
          type: "object",
          properties: {
            width: { type: "number", description: "Border width in pixels" },
            color: {
              type: "string",
              description: "Border color in hex (e.g. FF0000)",
            },
          },
          required: ["width", "color"],
          description: "Add a border",
        },
        crop: {
          type: "object",
          properties: {
            x: { type: "number", description: "Starting x coordinate" },
            y: { type: "number", description: "Starting y coordinate" },
            width: { type: "number", description: "Crop width" },
            height: { type: "number", description: "Crop height" },
          },
          required: ["x", "y", "width", "height"],
          description: "Crop the image",
        },
      },
      required: ["fileId"],
    },
  },
];

export async function handleToolCall(
  name: string,
  args: Record<string, any>
): Promise<string> {
  switch (name) {
    case "generate_test_key": {
      const baseUrl =
        args.baseUrl || getBaseUrl() || "https://api.getpronto.io/v1";
      const response = await fetch(`${baseUrl}/test-key`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.message || `Failed to generate test key: ${response.status}`
        );
      }

      const data = await response.json();
      setApiKey(data.apiKey, baseUrl);

      return JSON.stringify({
        message: "Ephemeral API key generated and configured",
        apiKey: data.apiKey,
        expiresAt: data.expiresAt,
        limits: data.limits,
      });
    }

    case "upload_image": {
      const client = getClient();
      const opts: { filename?: string; folder?: string } = {};
      if (args.filename) opts.filename = args.filename;
      if (args.folder) opts.folder = args.folder;

      const result = await client.files.upload(args.source, opts);
      return JSON.stringify(result.data);
    }

    case "list_files": {
      const client = getClient();
      const result = await client.files.list({
        page: args.page,
        pageSize: args.pageSize,
        folder: args.folder,
      });
      return JSON.stringify(result.data);
    }

    case "get_file": {
      const client = getClient();
      const result = await client.files.get(args.fileId);
      return JSON.stringify(result.data);
    }

    case "delete_file": {
      const client = getClient();
      await client.files.delete(args.fileId);
      return JSON.stringify({ message: "File deleted successfully" });
    }

    case "transform_image": {
      const client = getClient();
      let transformer = client.images.transform(args.fileId);

      if (args.width || args.height) {
        transformer = transformer.resize(args.width, args.height, args.fit);
      }
      if (args.quality) transformer = transformer.quality(args.quality);
      if (args.blur) transformer = transformer.blur(args.blur);
      if (args.sharpen) transformer = transformer.sharpen();
      if (args.grayscale) transformer = transformer.grayscale();
      if (args.rotate) transformer = transformer.rotate(args.rotate);
      if (args.format) transformer = transformer.format(args.format);
      if (args.border) {
        transformer = transformer.border(args.border.width, args.border.color);
      }
      if (args.crop) {
        transformer = transformer.crop(
          args.crop.x,
          args.crop.y,
          args.crop.width,
          args.crop.height
        );
      }

      const url = await transformer.toURL();
      return JSON.stringify({ url });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
