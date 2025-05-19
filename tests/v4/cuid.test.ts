import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const cuid_schemas = {
	"plain cuid": z.cuid(),
	"cuid with exact length": z.cuid().length(10),
	"cuid with min length": z.cuid().min(100),
	"cuid with max length": z.cuid().max(9)
};

const cuid2_schemas = {
	"plain cuid2": z.cuid2(),
	"cuid2 with exact length": z.cuid2().length(10),
	"cuid2 with min length": z.cuid2().min(100),
	"cuid2 with max length": z.cuid2().max(9)
};

describe("CUID generation", () => {
	test_schema_generation(cuid_schemas);
});
describe("CUID2 generation", () => {
	test_schema_generation(cuid2_schemas);
});
