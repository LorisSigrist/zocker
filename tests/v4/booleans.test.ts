import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const boolean_schemas = {
	"plain boolean": z.boolean()
} as const;

describe("Boolean generation", () => {
	test_schema_generation(boolean_schemas);
});
