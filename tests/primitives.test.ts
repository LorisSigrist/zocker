import { describe, expect, it, test } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const repeats = 100; //How many times should each test be repeated?

const schemas = {
	"plain number": z.number(),
	"plain string": z.string(),
	"plain boolean": z.boolean(),
	"plain date": z.date(),
	"plain bigint": z.bigint(),
	"plain undefined": z.undefined(),
	"plain null": z.null(),
	"plain void": z.void(),
	"number with max": z.number().max(3),
	"number with min and max": z.number().min(10_000).max(20_000),
	"number with min and max negative": z.number().min(-20).max(-10),
	"integer with max": z.number().int().max(10),
	"integer with min and max": z.number().int().min(10_000).max(20_000),
	"integer with min and max negative": z.number().int().min(-20).max(-10),
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
	"empty object": z.object({}),
	"object with number": z.object({ a: z.number() }),
	"object with number and string": z.object({ a: z.number(), b: z.string() }),
	"object with number with max": z.object({ a: z.number().max(10) }),
	"nested object": z.object({
		a: z.object({ b: z.object({ c: z.number() }) }),
		b: z.object({ c: z.object({ d: z.number() }) })
	}),
	"array of numbers": z.array(z.number()),
	"array of numbers with max": z.array(z.number().max(10)),
	"array of objects": z.array(z.object({ a: z.number() })),
	"array of objects with numbers with max": z.array(
		z.object({ a: z.number().max(10) })
	),
	"array of arrays of numbers": z.array(z.array(z.number())),
	"non-empty array of numbers": z.array(z.number()).nonempty(),
	"array with max length": z.array(z.number()).max(1),
	"array with min length": z.array(z.number()).min(10),
	"array with min and max length": z.array(z.number()).min(10).max(20),

	"array of objects with non-empty arrays of numbers": z.array(
		z.object({
			a: z.array(z.number()).nonempty()
		})
	),

	"array with exactly 10 elements": z.array(z.number()).length(10)
} as const;

const schema_keys = Object.keys(
	schemas
) as any as readonly (keyof typeof schemas)[];

describe("Primitive Schema", () => {
	test.concurrent.each(schema_keys)("generates valid data for %s", (key) => {
		const schema = schemas[key];
		const generate = zocker(schema);
		for (let i = 0; i < repeats; i++) {
			const data = generate();
			expect(() => schema.parse(data)).not.toThrow();
		}
	});
});
