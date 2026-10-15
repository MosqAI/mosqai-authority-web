import { describe, expect, it } from "vitest";
import { devices } from "@/lib/mock-data";
import { filterDevices } from "./devices-table";

describe("filterDevices", () => {
  it("returns everything with no filters", () => {
    expect(filterDevices(devices, "", "", "")).toHaveLength(devices.length);
  });

  it("matches id, area and type label case-insensitively", () => {
    expect(filterDevices(devices, "msq-004", "", "").map((d) => d.id)).toEqual(["MSQ-004"]);
    expect(filterDevices(devices, "gicumbi", "", "").every((d) => d.area === "Gicumbi")).toBe(true);
    expect(filterDevices(devices, "weather", "", "").every((d) => d.type === "WEATHER_SENSOR")).toBe(true);
  });

  it("combines type and status filters", () => {
    const result = filterDevices(devices, "", "MOSQUITO_TRAP", "OFFLINE");
    expect(result.map((d) => d.id)).toEqual(["MSQ-004"]);
  });
});
