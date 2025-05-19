import { describe, expect, it, test } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const repeats = 100; //How many times should each test be repeated?

const schemas = {
	"plain undefined": z.undefined(),
	"plain null": z.null(),
	"plain void": z.void(),
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

	"array of objects with non-empty arrays of strings with regex pattern":
		z.array(
			z.object({
				a: z.array(z.string().regex(/^[0-9]+$/)).nonempty()
			})
		),

	"array with exactly 10 elements": z.array(z.number()).length(10)
} as const;

describe("Primitive Schema", () => {
	test_schema_generation(schemas, repeats);
});
