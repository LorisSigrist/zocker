import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const set_schemas = {
	"set of strings": z.set(z.string()),
	"set of numbers": z.set(z.number()),
	"set of union": z.set(z.union([z.string(), z.number()])),
	"set of union of objects": z.set(
		z.union([z.object({ a: z.string() }), z.object({ b: z.number() })])
	)
} as const;

describe("Set generation", () => {
	test_schema_generation(set_schemas);
});
