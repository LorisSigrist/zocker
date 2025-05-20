import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const tuple_schemas = {
	"tuple of numbers and strings": z.tuple([z.number(), z.string()]),
	"tuple of numbers and booleans": z.tuple([z.number(), z.boolean()]),
	"tuple of numbers and dates": z.tuple([z.number(), z.date()]),

	"tuple of numbers and objects": z.tuple([z.number(), z.object({})]),
	"tuple of numbers and arrays": z.tuple([z.number(), z.array(z.number())])
} as const;

describe("Tuple generation", () => {
	test_schema_generation(tuple_schemas);
});
