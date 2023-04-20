import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const union_schemas = {
	"union of numbers and strings": z.union([z.number(), z.string()]),
	"union of numbers and booleans": z.union([z.number(), z.boolean()]),
	"union of numbers and dates": z.union([z.number(), z.date()]),
	"union of numbers and objects": z.union([z.number(), z.object({})]),
	"union of numbers and arrays": z.union([z.number(), z.array(z.number())])
} as const;

describe("Union generation", () => {
	test_schema_generation(union_schemas);
});
