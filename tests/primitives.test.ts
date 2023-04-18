import { describe, expect, it, test } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const repeats = 500; //How many times should each test be repeated?

const schemas = {
	"plain number": z.number(),
	"plain string": z.string(),
	"plain boolean": z.boolean(),
	"plain date": z.date(),
	"plain bigint": z.bigint(),
	"plain undefined": z.undefined(),
	"plain null": z.null(),
	"plain void": z.void(),
	"number with max": z.number().max(10),
	"number with min and max": z.number().min(10).max(20),
	"number with min and max negative": z.number().min(-20).max(-10),
	"integer with max": z.number().int().max(10),
	"integer with min and max": z.number().int().min(10).max(20),
	"integer with min and max negative": z.number().int().min(-20).max(-10),
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
