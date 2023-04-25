import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const invalid_string_schemas = {
    "string with min > max": z.string().min(10).max(5),
    "string with incompatible starts_with values": z.string().startsWith("foo").startsWith("bar"),
    "string with incompatible ends_with values": z.string().endsWith("foo").endsWith("bar"),
    "multiple incompatible ip versions": z.string().ip({ version: "v4" }).ip({ version: "v6" }),
} as const;

describe("Invalid string generation", () => {
    for (const [name, schema] of Object.entries(invalid_string_schemas)) {
        it("fails on " + name, () => {
            const generate = zocker(schema);
            expect(() => generate()).toThrow();
        });
    }
});