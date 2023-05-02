import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const number_schemas = {
	"plain number": z.number(),
	"number with max": z.number().max(3),
	"number with min and max": z.number().min(10_000).max(20_000),
	"number with min and max negative": z.number().min(-20).max(-10),
	"number exact": z.number().max(10).min(10),
	"integer with max": z.number().int().max(10),
	"integer with min and max": z.number().int().min(10_000).max(20_000),
	"integer with min and max negative": z.number().int().min(-20).max(-10),
	"integer exact": z.number().int().max(10).min(10),
	"number lte": z.number().lte(10),
	"number gte": z.number().gte(10),
	"number lt": z.number().lt(10),
	"number gt": z.number().gt(10),
	"integer lte": z.number().int().lte(10),
	"integer gte": z.number().int().gte(10),
	"integer lt": z.number().int().lt(10),
	"integer gt": z.number().int().gt(10),
	"number multipleof": z.number().multipleOf(10),
	"integer multipleof": z.number().int().multipleOf(10),
	"interger mutliple multipleof": z
		.number()
		.int()
		.multipleOf(10)
		.multipleOf(5)
		.multipleOf(3),
	"number with multiple mins and maxs": z
		.number()
		.min(10)
		.max(20)
		.min(15)
		.max(25)
} as const;

describe("Number generation", () => {
	test_schema_generation(number_schemas);
});
