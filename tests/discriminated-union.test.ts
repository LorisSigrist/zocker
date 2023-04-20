import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const discriminated_union_schemas = {
	"discriminated union": z.discriminatedUnion("type", [
		z.object({ type: z.literal("A") }),
		z.object({ type: z.literal("B") })
	])
} as const;

describe("Discriminated Union generation", () => {
	test_schema_generation(discriminated_union_schemas);
});
