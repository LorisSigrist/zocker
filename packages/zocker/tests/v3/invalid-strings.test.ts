import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../../src";

const invalid_string_schemas = {
	"string with min > max": z.string().min(10).max(5),
	"string with incompatible starts_with values": z
		.string()
		.startsWith("foo")
		.startsWith("bar"),
	"string with incompatible ends_with values": z
		.string()
		.endsWith("foo")
		.endsWith("bar"),
	"multiple incompatible ip versions": z
		.string()
		.ip({ version: "v4" })
		.ip({ version: "v6" }),
	"multiple different regexes": z.string().regex(/foo/).regex(/foo2/),
	"regex with starts_with": z.string().regex(/foo/).startsWith("foo"),
	"regex with ends_with": z.string().regex(/foo/).endsWith("foo"),
	"regex with includes": z.string().regex(/foo/).includes("foo"),
	"strings with multiple incompatible formats": z.string().uuid().email()
} as const;

describe("Invalid string generation", () => {
	for (const [name, schema] of Object.entries(invalid_string_schemas)) {
		it("fails on " + name, () => {
			expect(() => zocker(schema).generate()).toThrow();
		});
	}
});
