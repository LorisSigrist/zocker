import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const nanoid_schemas = {
	"plain nanoid": z.nanoid()
};

describe("Nanoid generation", () => {
	test_schema_generation(nanoid_schemas);
});
