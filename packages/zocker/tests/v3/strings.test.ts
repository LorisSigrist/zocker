import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../../src";
import { test_schema_generation } from "./utils";

const string_schemas = {
	"plain string": z.string(),
	"string with exact length": z.string().length(10),
	"string with min and max length": z.string().min(1_000).max(2_000),
	uuid: z.string().uuid(),
	"ip (version unspecivied)": z.string().ip(),
	"ip v4": z.string().ip({ version: "v4" }),
	"ip v6": z.string().ip({ version: "v6" }),
	url: z.string().url(),
	regex: z.string().regex(/<([a-z]\w{0,20})>foo<\1>/),
	"regex with flags": z
		.string()
		.regex(new RegExp("(sun|mon|tue|wednes|thurs|fri|satur)day", "i")),
	email: z.string().email(),
	"ISO datetime": z.string().datetime(),
	cuid: z.string().cuid(),
	cuid2: z.string().cuid2(),
	ulid: z.string().ulid(),
	emoji: z.string().emoji(),
	"emoji with min-length": z.string().emoji().min(5),
	"ends with": z.string().endsWith("foo"),
	"starts with": z.string().startsWith("foo"),
	includes: z.string().includes("foo").includes("bar"),
	"multiple starts with": z
		.string()
		.startsWith("some_string")
		.startsWith("some_string_that_is_longer"),
	"multiple ends with": z
		.string()
		.endsWith("a_string")
		.endsWith("this_is_a_string"),
	"multiple ip-v4 flags": z
		.string()
		.ip({ version: "v4" })
		.ip({ version: "v4" }),
	"multiple ip-v6 flags": z
		.string()
		.ip({ version: "v6" })
		.ip({ version: "v6" }),
	"ip-v4 and unspecified": z.string().ip({ version: "v4" }).ip(), //should be narrowed to v4
	"ip-v6 and unspecified": z.string().ip({ version: "v6" }).ip(), //should be narrowed to v6,
	"unspecified and ip-v4": z.string().ip().ip({ version: "v4" }), //should be narrowed to v4
	"unspecified and ip-v6": z.string().ip().ip({ version: "v6" }), //should be narrowed to v6,
	"starts with and length": z.string().startsWith("foo").length(3),
	"ends with and length": z.string().endsWith("foo").length(3),
	"starts with and includes with length": z
		.string()
		.startsWith("foo")
		.includes("oo")
		.length(3),
	"ends with and includes with length": z
		.string()
		.endsWith("foo")
		.includes("oo")
		.length(3),
	"date with offset": z.string().datetime({ offset: true }),
	"regex with no whitespace": z.string().regex(/^[^\s-]$/)
} as const;

describe("String generation", () => {
	test_schema_generation(string_schemas);

	it("should generate Uppercase strings when toUpperCase() is used", () => {
		const transformed_schema = z
			.string()
			.regex(/[a-z]*/)
			.toUpperCase();
		const uppercase_schema = z.string().regex(/[A-Z]*/);

		const generated = zocker(transformed_schema).generate();
		expect(() => uppercase_schema.parse(generated)).not.toThrow();
	});

	it("should generate Lowercase strings when toLowerCase() is used", () => {
		const transformed_schema = z
			.string()
			.regex(/[A-Z]*/)
			.toLowerCase();
		const lowercase_schema = z.string().regex(/[a-z]*/);

		const generated = zocker(transformed_schema).generate();
		expect(() => lowercase_schema.parse(generated)).not.toThrow();
	});

	it("should generate trimmed strings when trim() is used", () => {
		const transformed_schema = z
			.string()
			.regex(/\W+foo\W+/)
			.trim();
		const trimmed_schema = z.string().regex(/foo/);

		const generated = zocker(transformed_schema).generate();
		expect(() => trimmed_schema.parse(generated)).not.toThrow();
	});
});
