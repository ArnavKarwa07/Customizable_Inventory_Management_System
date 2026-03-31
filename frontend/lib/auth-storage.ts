export const ACCESS_TOKEN_KEY = "inventory_access_token";
export const REFRESH_TOKEN_KEY = "inventory_refresh_token";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export function getTokens(): Tokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function setTokens(tokens: Tokens): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  // Also set cookies for middleware
  document.cookie = `${ACCESS_TOKEN_KEY}=${tokens.accessToken}; path=/; max-age=86400`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${tokens.refreshToken}; path=/; max-age=604800`;
}

export function clearTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  // Clear cookies
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
}
