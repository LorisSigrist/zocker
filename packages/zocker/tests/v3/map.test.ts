import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const map_schemas = {
	"map of numbers to strings": z.map(z.number(), z.string()),
	"map of numbers to numbers": z.map(z.number(), z.number()),
	"map of objects to objects": z.map(
		z.object({ a: z.number() }),
		z.object({ b: z.string() })
	)
} as const;

describe("Map generation", () => {
	test_schema_generation(map_schemas);
});
