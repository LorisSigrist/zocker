import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const lazy_schemas = {
	"lazy string": z.lazy(() => z.string()),
	"lazy number": z.lazy(() => z.number()),
	"lazy union": z.lazy(() => z.union([z.string(), z.number()]))
} as const;

describe("Lazy generation", () => {
	test_schema_generation(lazy_schemas);
});
