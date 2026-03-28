import GetProntoClient from "getpronto-sdk";

let client: InstanceType<typeof GetProntoClient> | null = null;
let currentApiKey: string | null = null;
let currentBaseUrl: string | undefined;

export function setBaseUrl(baseUrl: string): void {
  currentBaseUrl = baseUrl;
}

export function setApiKey(key: string, baseUrl?: string): void {
  currentApiKey = key;
  if (baseUrl) currentBaseUrl = baseUrl;
  client = new GetProntoClient({
    apiKey: key,
    ...(baseUrl && { baseUrl }),
  });
}

export function getClient(): InstanceType<typeof GetProntoClient> {
  if (!client) {
    throw new Error(
      "No API key configured. Use the generate_test_key tool or set GETPRONTO_API_KEY environment variable."
    );
  }
  return client;
}

export function getApiKey(): string | null {
  return currentApiKey;
}

export function getBaseUrl(): string | undefined {
  return currentBaseUrl;
}
