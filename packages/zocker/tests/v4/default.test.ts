import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const schemas_with_defaults = {
	"string with default": z.string().default("foo"),
	"number with default": z.number().default(42),
	"boolean with default": z.boolean().default(true),
	"bigint with default": z.bigint().default(42n),
	"date with default": z.date().default(new Date(2020, 1, 1)),
	"array of objects with default": z
		.array(z.object({ foo: z.string() }))
		.default([{ foo: "bar" }])
} as const;

describe("Schemas with defaults", () => {
	test_schema_generation(schemas_with_defaults);
});
