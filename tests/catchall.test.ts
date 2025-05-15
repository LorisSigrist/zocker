import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const catchall_schemas = {
	catchall: z.object({ a: z.string(), b: z.number() }).catchall(z.string()),
	"catchall passthrough": z
		.object({ a: z.string(), b: z.number() })
		.passthrough()
		.catchall(z.string()),
	passthrough: z.object({ a: z.string(), b: z.number() }).passthrough()
} as const;

describe("Catchall generation", () => {
	test_schema_generation(catchall_schemas);
});
