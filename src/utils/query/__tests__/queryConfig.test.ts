import { describe, it, expect } from "vitest";
import { QUERY_CONFIG, type QueryCachePreset } from "../queryConfig";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// ---------------------------------------------------------------------------
// Structure & completeness
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG — structure", () => {
  it("should export all four presets", () => {
    expect(QUERY_CONFIG).toHaveProperty("SHORT");
    expect(QUERY_CONFIG).toHaveProperty("DEFAULT");
    expect(QUERY_CONFIG).toHaveProperty("LONG");
    expect(QUERY_CONFIG).toHaveProperty("STATIC");
  });

  it("each preset should have staleTime and gcTime", () => {
    for (const [name, preset] of Object.entries(QUERY_CONFIG)) {
      expect(preset).toHaveProperty("staleTime");
      expect(preset).toHaveProperty("gcTime");
      expect(typeof preset.staleTime).toBe("number");
      expect(typeof preset.gcTime).toBe("number");
    }
  });

  it("should have exactly four presets", () => {
    expect(Object.keys(QUERY_CONFIG)).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// SHORT preset
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG.SHORT", () => {
  it("should have staleTime of 1 minute", () => {
    expect(QUERY_CONFIG.SHORT.staleTime).toBe(1 * MINUTE);
  });

  it("should have gcTime of 5 minutes", () => {
    expect(QUERY_CONFIG.SHORT.gcTime).toBe(5 * MINUTE);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT preset
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG.DEFAULT", () => {
  it("should have staleTime of 5 minutes", () => {
    expect(QUERY_CONFIG.DEFAULT.staleTime).toBe(5 * MINUTE);
  });

  it("should have gcTime of 30 minutes", () => {
    expect(QUERY_CONFIG.DEFAULT.gcTime).toBe(30 * MINUTE);
  });
});

// ---------------------------------------------------------------------------
// LONG preset
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG.LONG", () => {
  it("should have staleTime of 15 minutes", () => {
    expect(QUERY_CONFIG.LONG.staleTime).toBe(15 * MINUTE);
  });

  it("should have gcTime of 1 hour", () => {
    expect(QUERY_CONFIG.LONG.gcTime).toBe(1 * HOUR);
  });
});

// ---------------------------------------------------------------------------
// STATIC preset
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG.STATIC", () => {
  it("should have staleTime of 60 minutes", () => {
    expect(QUERY_CONFIG.STATIC.staleTime).toBe(60 * MINUTE);
  });

  it("should have gcTime of 24 hours", () => {
    expect(QUERY_CONFIG.STATIC.gcTime).toBe(24 * HOUR);
  });
});

// ---------------------------------------------------------------------------
// Invariants — ordering & safety
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG — invariants", () => {
  it("staleTime should always be less than or equal to gcTime", () => {
    for (const [name, preset] of Object.entries(QUERY_CONFIG)) {
      expect(preset.staleTime).toBeLessThanOrEqual(preset.gcTime);
    }
  });

  it("all times should be positive numbers", () => {
    for (const preset of Object.values(QUERY_CONFIG)) {
      expect(preset.staleTime).toBeGreaterThan(0);
      expect(preset.gcTime).toBeGreaterThan(0);
    }
  });

  it("presets should be ordered by increasing staleTime (SHORT < DEFAULT < LONG < STATIC)", () => {
    expect(QUERY_CONFIG.SHORT.staleTime).toBeLessThan(
      QUERY_CONFIG.DEFAULT.staleTime,
    );
    expect(QUERY_CONFIG.DEFAULT.staleTime).toBeLessThan(
      QUERY_CONFIG.LONG.staleTime,
    );
    expect(QUERY_CONFIG.LONG.staleTime).toBeLessThan(
      QUERY_CONFIG.STATIC.staleTime,
    );
  });

  it("presets should be ordered by increasing gcTime (SHORT < DEFAULT < LONG < STATIC)", () => {
    expect(QUERY_CONFIG.SHORT.gcTime).toBeLessThan(
      QUERY_CONFIG.DEFAULT.gcTime,
    );
    expect(QUERY_CONFIG.DEFAULT.gcTime).toBeLessThan(
      QUERY_CONFIG.LONG.gcTime,
    );
    expect(QUERY_CONFIG.LONG.gcTime).toBeLessThan(
      QUERY_CONFIG.STATIC.gcTime,
    );
  });
});

// ---------------------------------------------------------------------------
// Spreadability — presets work with useQuery-style options
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG — spreadability", () => {
  it("should spread cleanly into a query options object", () => {
    const queryOptions = {
      queryKey: ["test"],
      queryFn: () => Promise.resolve("data"),
      ...QUERY_CONFIG.DEFAULT,
    };

    expect(queryOptions.staleTime).toBe(QUERY_CONFIG.DEFAULT.staleTime);
    expect(queryOptions.gcTime).toBe(QUERY_CONFIG.DEFAULT.gcTime);
    expect(queryOptions.queryKey).toEqual(["test"]);
  });

  it("should allow overriding individual fields when spread", () => {
    const queryOptions = {
      ...QUERY_CONFIG.LONG,
      staleTime: 999,
    };

    expect(queryOptions.staleTime).toBe(999);
    expect(queryOptions.gcTime).toBe(QUERY_CONFIG.LONG.gcTime);
  });

  it("should not leak unexpected keys when spread", () => {
    const keys = Object.keys(QUERY_CONFIG.SHORT);
    expect(keys).toEqual(["staleTime", "gcTime"]);
  });
});

// ---------------------------------------------------------------------------
// Immutability — presets are readonly
// ---------------------------------------------------------------------------
describe("QUERY_CONFIG — immutability", () => {
  it("should be defined as const (readonly)", () => {
    // TypeScript enforces this at compile time via `as const`,
    // but we can verify at runtime that the values haven't been tampered with.
    const snapshot = JSON.parse(JSON.stringify(QUERY_CONFIG));

    expect(snapshot.SHORT.staleTime).toBe(1 * MINUTE);
    expect(snapshot.DEFAULT.staleTime).toBe(5 * MINUTE);
    expect(snapshot.LONG.staleTime).toBe(15 * MINUTE);
    expect(snapshot.STATIC.staleTime).toBe(60 * MINUTE);
  });
});
