import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { zocker } from "../../src";
import { test_schema_generation } from "./utils";

const any_schemas = {
	"plain any": z.any()
} as const;

describe("Any generation", () => {
	test_schema_generation(any_schemas);

	it("generates the same value for the same seed", () => {
		for (let i = 0; i < 100; i++) {
			const s = z.any();
			const value1 = zocker(s, { seed: i });
			const value2 = zocker(s, { seed: i });

			expect(value1).toEqual(value2);
		}
	});
});
