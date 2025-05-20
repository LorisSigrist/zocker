import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const object_schemas = {
	"basic object": z.object({ a: z.number(), b: z.string() }),
	"strict object": z.strictObject({ a: z.number(), b: z.string() }),
	"loose object": z.looseObject({ a: z.number(), b: z.string() }),
	"nested object": z.object({ a: z.object({ b: z.object({ c: z.number() }) }) })
} as const;

describe("Object generation", () => {
	test_schema_generation(object_schemas);
});
