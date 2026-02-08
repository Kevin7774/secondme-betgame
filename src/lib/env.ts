type ServerEnv = {
  SECONDME_CLIENT_ID: string;
  SECONDME_CLIENT_SECRET: string;
  SECONDME_REDIRECT_URI: string;
  SECONDME_API_BASE_URL: string;
  SECONDME_OAUTH_URL: string;
  SECONDME_TOKEN_ENDPOINT: string;
};

let cached: ServerEnv | null = null;

function requireEnv(key: keyof ServerEnv) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getServerEnv() {
  if (cached) {
    return cached;
  }

  cached = {
    SECONDME_CLIENT_ID: requireEnv("SECONDME_CLIENT_ID"),
    SECONDME_CLIENT_SECRET: requireEnv("SECONDME_CLIENT_SECRET"),
    SECONDME_REDIRECT_URI: requireEnv("SECONDME_REDIRECT_URI"),
    SECONDME_API_BASE_URL: requireEnv("SECONDME_API_BASE_URL"),
    SECONDME_OAUTH_URL: requireEnv("SECONDME_OAUTH_URL"),
    SECONDME_TOKEN_ENDPOINT: requireEnv("SECONDME_TOKEN_ENDPOINT"),
  };

  return cached;
}
