import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const preprocessed_schemas = {
	"schema with preprcess": z.preprocess(() => "", z.string())
} as const;

describe("Map generation", () => {
	test_schema_generation(preprocessed_schemas);
});
