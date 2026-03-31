import { clearTokens, getTokens, setTokens } from "@/lib/auth-storage";

describe("auth storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves access and refresh tokens", () => {
    setTokens({ accessToken: "token-a", refreshToken: "token-r" });
    expect(getTokens()).toEqual({
      accessToken: "token-a",
      refreshToken: "token-r",
    });
  });

  it("clears tokens", () => {
    setTokens({ accessToken: "token-a", refreshToken: "token-r" });
    clearTokens();
    expect(getTokens()).toBeNull();
  });
});
