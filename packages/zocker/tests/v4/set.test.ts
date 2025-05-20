import { describe } from "vitest";
import { z } from "zod/v4";
import { z as zm } from "zod/v4-mini";
import { test_schema_generation } from "./utils";

const set_schemas = {
	"set of strings": z.set(z.string()),
	"set of numbers": z.set(z.number()),
	"set of union": z.set(z.union([z.string(), z.number()])),
	"set of union of objects": z.set(
		z.union([z.object({ a: z.string() }), z.object({ b: z.number() })])
	)
} as const;

const set_schemas_mini = {
	"set of strings": zm.set(zm.string()),
	"set of numbers": zm.set(zm.number()),
	"set of union": zm.set(zm.union([zm.string(), zm.number()])),
	"set of union of objects": zm.set(
		zm.union([zm.object({ a: zm.string() }), zm.object({ b: zm.number() })])
	)
} as const;

describe("Set generation", () => {
	test_schema_generation(set_schemas);
});

describe("Set generation (zod-mini)", () => {
	test_schema_generation(set_schemas_mini);
});
