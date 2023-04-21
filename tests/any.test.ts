import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";
import { test_schema_generation } from "./utils";

const any_schemas = {
	"plain any": z.any()
} as const;

const generate = zocker(z.any());

describe("Any generation", () => {
	test_schema_generation(any_schemas);

	it("generates the same value for the same seed", () => {
		const seed = 1234;
		const value1 = generate({ seed });
		const value2 = generate({ seed });

		expect(value1).toEqual(value2);
	});
});
