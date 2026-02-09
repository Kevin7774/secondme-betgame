import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

type SecondMeStateConfig = {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  database_url?: string;
  allowed_scopes?: string[];
};

type SecondMeStateApi = {
  base_url?: string;
  api_prefix?: string;
  oauth_url?: string;
  token_endpoint?: string;
};

export type SecondMeState = {
  stage?: string;
  app_name?: string;
  modules?: string[];
  config?: SecondMeStateConfig;
  api?: SecondMeStateApi;
};

let cachedState: SecondMeState | null | undefined;

function parseState(input: string) {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as SecondMeState;
    }
  } catch {
    // ignore
  }

  return null;
}

export function getSecondMeState() {
  if (cachedState !== undefined) {
    return cachedState;
  }

  try {
    const file = join(process.cwd(), ".secondme", "state.json");
    const content = readFileSync(file, "utf-8");
    cachedState = parseState(content);
  } catch {
    cachedState = null;
  }

  return cachedState;
}
