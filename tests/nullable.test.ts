import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const nullable_schemas = {
	"nullable number": z.number().nullable(),
	"nullable string": z.string().nullable(),
	"nullable boolean": z.boolean().nullable(),
	"nullable date": z.date().nullable(),
	"nullable object": z.object({}).nullable(),
	"nullable array": z.array(z.number()).nullable()
} as const;

describe("Nullable generation", () => {
	test_schema_generation(nullable_schemas);
});
