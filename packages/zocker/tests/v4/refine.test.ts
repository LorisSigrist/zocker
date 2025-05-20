import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const refined_schemas = {
	"schema with refinement": z
		.string()
		.refine((check) => true, { message: "refinement failed" })
} as const;

describe("Map generation", () => {
	test_schema_generation(refined_schemas);
});
