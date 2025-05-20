import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const literal_schemas = {
	"plain literal": z.literal("foo"),
	"literal with max": z.literal(5)
} as const;

describe("Literal generation", () => {
	test_schema_generation(literal_schemas);
});
