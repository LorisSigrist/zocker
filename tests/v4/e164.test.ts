import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const e164_schemas = {
	"plain e164 number": z.e164()
};

describe("E164 generation", () => {
	test_schema_generation(e164_schemas);
});
