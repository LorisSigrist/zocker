import { describe } from "vitest";
import { z } from "zod";
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
	"multiple starts with": z.string().startsWith("some_string").startsWith("some_string_that_is_longer"),
	"multiple ends with": z.string().endsWith("a_string").endsWith("this_is_a_string"),
} as const;

describe("String generation", () => {
	test_schema_generation(string_schemas);
});
