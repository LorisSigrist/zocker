import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const base64_schemas = {
	"plain base64": z.base64(),
	"plain base64 url": z.base64url()
} as const;

describe("Any generation", () => {
	test_schema_generation(base64_schemas);
});
