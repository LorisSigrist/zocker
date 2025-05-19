import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const ulid_schemas = {
	"plain ulid": z.ulid(),

	// Length must be exactly 26
	"ulid with min-length": z.ulid().min(26),
	"ulid with max-length": z.ulid().max(26),
	"ulid with exact-length": z.ulid().length(26),

	"ulid starts with": z.ulid().startsWith("0123456789"),
	"ulid ends with": z.ulid().endsWith("0123456789"),
	"ulid includes": z.ulid().includes("0123456789")
};

describe("ULID generation", () => {
	test_schema_generation(ulid_schemas);
});
