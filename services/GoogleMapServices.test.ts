import { getLatLng } from "./GoogleMapsServices.js";
import { describe, expect, it } from "vitest";

describe("getLatLng", () => {
  it("should return the latitude and longitude of an address", async () => {
    const address = "4569 Totteridge Ln";
    const city = "Virginia Beach";
    const state = "VA";
    const location = await getLatLng(address, city, state);
    expect(location.lat).toBeDefined();
    expect(location.lng).toBeDefined();
  });
});
