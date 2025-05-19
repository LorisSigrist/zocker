import { describe, expect, test } from "vitest";
import { z } from "zod";
import { zocker } from "../../src";

const repeats = 100;

const promise_schemas = {
	"promise of number": z.promise(z.number()),
	"promise of string": z.promise(z.string()),
	"promise of boolean": z.promise(z.boolean()),
	"promise of date": z.promise(z.date()),
	"promise of bigint": z.promise(z.bigint()),
	"promise of undefined": z.promise(z.undefined()),
	"promise of null": z.promise(z.null()),
	"promise of a promise of a promise of a number": z.promise(
		z.promise(z.promise(z.number()))
	)
} as const;

const schema_keys = Object.keys(
	promise_schemas
) as any as readonly (keyof typeof promise_schemas)[];

describe("Promise generation", () => {
	test.each(schema_keys)("generates valid data for %s", async (key) => {
		const schema = promise_schemas[key];
		for (let i = 0; i < repeats; i++) {
			const data = zocker(schema).generate();
			await expect(schema.parseAsync(data)).resolves.toEqual(await data);
		}
	});
});
