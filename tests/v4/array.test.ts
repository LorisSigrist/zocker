import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const array_schemas = {
	"plain number array": z.array(z.number()),
	"number array with max": z.array(z.number()).max(10),
	"number array with min": z.array(z.number()).min(10),
	"number array with exact length": z.array(z.number()).length(10)
};

describe("Array generation", () => {
	test_schema_generation(array_schemas);
});
