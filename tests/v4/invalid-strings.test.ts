import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { zocker } from "../../src";

const invalid_string_schemas = {
	// "string with min > max": z.string().min(10).max(5), - Zod already throws an error here
	"string with incompatible starts_with values": z
		.string()
		.startsWith("foo")
		.startsWith("bar"),
	"string with incompatible ends_with values": z
		.string()
		.endsWith("foo")
		.endsWith("bar"),
	"multiple different regexes": z.string().regex(/foo/).regex(/foo2/),
	"regex with starts_with": z.string().regex(/foo/).startsWith("foo"),
	"regex with ends_with": z.string().regex(/foo/).endsWith("foo"),
	"regex with includes": z.string().regex(/foo/).includes("foo")
} as const;

describe("Invalid string generation", () => {
	for (const [name, schema] of Object.entries(invalid_string_schemas)) {
		it("fails on " + name, () => {
			expect(() => {
				// should fail
				const value = zocker(schema).generate();
				console.error("Expected failure, but", value, "was generated");
			}).toThrow();
		});
	}
});
