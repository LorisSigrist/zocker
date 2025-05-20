import { z } from "zod/v4";
import { describe } from "vitest";
import { test_schema_generation } from "../utils";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([
		literalSchema,
		z.array(jsonSchema),
		z.record(z.string(), jsonSchema)
	])
);

describe("Example JSON schema", () => {
	test_schema_generation({ JSON: jsonSchema }, 10);
});
