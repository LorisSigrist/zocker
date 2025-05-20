import { describe, it, expect } from "vitest";
import { zocker } from "../../src";
import { z } from "zod/v4";

describe("Supply", () => {
	it("works with .shape.", () => {
		const person_schema = z.object({
			name: z.string(),
			age: z.number()
		});

		const generated = zocker(person_schema)
			.supply(person_schema.shape.name, "John Doe")
			.generate();

		expect(generated.name).toEqual("John Doe");
	});

	it("works with a sub-schema.", () => {
		const name_schema = z.string().min(2);
		const person_schema = z.object({
			name: name_schema,
			age: z.number()
		});

		const generated = zocker(person_schema)
			.supply(name_schema, "John Doe")
			.generate();

		expect(generated.name).toEqual("John Doe");
	});
});
