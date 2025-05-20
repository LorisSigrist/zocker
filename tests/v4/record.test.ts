import { describe, it } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const record_schemas = {
	"record of numbers": z.record(z.coerce.number() as any, z.number()),
	"record with enum": z.record(z.enum(["a", "b", "c"]), z.number()), // zod 4 expects all enum keys to be exhausted
	"record with enum (partial)": z.partialRecord(
		z.enum(["a", "b", "c"]),
		z.number()
	), // zod 4 expects all enum keys to be exhausted
	"record of objects": z.record(z.string(), z.object({ b: z.string() })),
	"record of objects with strings with regex pattern": z.record(
		z.string().regex(/^[0-9]+$/),
		z.object({ b: z.string() })
	),
	"record with symbol keys": z.record(z.symbol(), z.number())
} as const;

const partial_record_schemas = {
	"partial record with enum": z.partialRecord(
		z.enum(["a", "b", "c"]),
		z.number()
	)
};

describe("Record generation", () => {
	test_schema_generation(record_schemas);
	test_schema_generation(partial_record_schemas);
});
