import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const ksuid_schemas = {
	"plain ksuid": z.ksuid()
};

describe("KSUID generation", () => {
	test_schema_generation(ksuid_schemas);
});
