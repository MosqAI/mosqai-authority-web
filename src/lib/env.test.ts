import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";

const valid = {
  NEXT_PUBLIC_API_URL: "http://localhost:3000",
  NEXT_PUBLIC_WS_URL: "ws://localhost:3000",
  NEXT_PUBLIC_MAP_STYLE_URL: "https://demotiles.maplibre.org/style.json",
};

describe("parsePublicEnv", () => {
  it("accepts a complete, valid environment", () => {
    expect(parsePublicEnv(valid)).toEqual(valid);
  });

  it("rejects a missing API URL", () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_API_URL: undefined })).toThrow(
      /NEXT_PUBLIC_API_URL/,
    );
  });

  it("rejects a WebSocket URL that is not ws:// or wss://", () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_WS_URL: "http://localhost:3000" })).toThrow(
      /NEXT_PUBLIC_WS_URL/,
    );
  });
});
