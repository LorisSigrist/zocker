import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const any_schemas = {
	"plain any": z.any()
} as const;

describe("Any generation", () => {
	test_schema_generation(any_schemas);
});
