import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const primitive_schemas = {
	"plain string": z.string(),
	"plain number": z.number(),
	"plain bigint": z.bigint(),
	"plain boolean": z.boolean(),
	"plain undefined": z.undefined(),
	"plain null": z.null(),
	"plain void": z.void(),
	"plain literal": z.literal("foo"),
	"plain NaN": z.nan(),
	"plain date": z.date(),
	"plain symbol": z.symbol(),
	"plain unknown": z.unknown()
} as const;

describe("Primitive generation", () => {
	test_schema_generation(primitive_schemas);
});
