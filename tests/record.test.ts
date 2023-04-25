import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const record_schemas = {
	"record of numbers": z.record(z.number()),
	"record of objects": z.record(z.object({ b: z.string() })),
	"record of objects with strings with regex pattern": z.record(
		z.string().regex(/^[0-9]+$/),
		z.object({ b: z.string() })
	)
} as const;

describe("Record generation", () => {
	test_schema_generation(record_schemas);
});
