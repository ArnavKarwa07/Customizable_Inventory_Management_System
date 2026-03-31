import { apiClient } from "@/lib/api-client";
import * as storage from "@/lib/auth-storage";

describe("apiClient interceptors", () => {
  it("attaches authorization header when token exists", async () => {
    jest.spyOn(storage, "getTokens").mockReturnValue({
      accessToken: "abc",
      refreshToken: "def",
    });

    const requestInterceptor = (apiClient.interceptors.request as any)
      .handlers[0].fulfilled;
    const updated = await requestInterceptor({ headers: {} });

    expect(updated.headers.Authorization).toBe("Bearer abc");
  });
});
