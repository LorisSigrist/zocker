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
		for (let i = 0; i < 100; i++) {
			const value1 = generate({ seed: i });
			const value2 = generate({ seed: i });

			expect(value1).toEqual(value2);
		}
	});
});
