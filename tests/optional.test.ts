import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const optional_schemas = {
	"optional number": z.number().optional(),
	"optional string": z.string().optional(),
	"optional boolean": z.boolean().optional(),
	"optional date": z.date().optional(),
	"optional object": z.object({}).optional(),
	"optional array": z.array(z.number()).optional()
} as const;

describe("Optional generation", () => {
	test_schema_generation(optional_schemas);
});
