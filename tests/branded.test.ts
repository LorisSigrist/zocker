import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const branded_schemas = {
	"plain branded": z.string().brand("foo")
} as const;

describe("Branded generation", () => {
	test_schema_generation(branded_schemas);
});
