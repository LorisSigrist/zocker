import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const primitive_schemas = {
	"readonly string": z.string().readonly(),
	"readonly number": z.number().readonly(),
	"readonly object": z
		.object({
			foo: z.string()
		})
		.readonly()
} as const;

describe("Readonly generation", () => {
	test_schema_generation(primitive_schemas);
});
