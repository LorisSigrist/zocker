import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const union_schemas = {
	"union of numbers and strings": z.union([z.number(), z.string()]),
	"union of numbers and booleans": z.union([z.number(), z.boolean()]),
	"union of numbers and dates": z.union([z.number(), z.date()]),
	"union of numbers and objects": z.union([z.number(), z.object({})]),
	"union of numbers and arrays": z.union([z.number(), z.array(z.number())])
} as const;

const discrimintated_union_schemas = {
	"plain discriminated union": z.discriminatedUnion("type", [
		z.object({ type: z.literal("A") }),
		z.object({ type: z.literal("B") })
	])
};

describe("Union generation", () => {
	test_schema_generation(union_schemas);
});

describe("Discriminated Union generation", () => {
	test_schema_generation(discrimintated_union_schemas);
});
