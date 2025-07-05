import { describe, it, expect } from "vitest";
import { zocker } from "../../src";
import { z } from "zod/v4";
import * as core from "zod/v4/core";

describe("Override", () => {
	it("works", () => {
		const schema = z.object({
			name: z.string(),
			age: z.number()
		});

		const generated = zocker(schema)
			.override("number", (schema) => 5)
			.generate();

		expect(generated.age).toBe(5);
	});

	it("works(class)", () => {
		const schema = z.object({
			name: z.string(),
			age: z.number()
		});

		const generated = zocker(schema)
			.override(z.ZodNumber, (schema) => 5)
			.generate();

		expect(generated.age).toBe(5);
	});

	it("works(core class)", () => {
		const schema = z.object({
			name: z.string(),
			age: z.number()
		});

		const generated = zocker(schema)
			.override(core.$ZodNumber, (schema) => 5)
			.generate();

		expect(generated.age).toBe(5);
	});
});
