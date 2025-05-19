import { describe, expect, it } from "vitest";
import { zocker } from "../../src";
import { z } from "zod";

describe("Transform generation", () => {
	it("Generates valid data for strings with transforms", () => {
		const chained_schema = z
			.string()
			.length(2)
			.transform((s) => s + s);
		const result_schema = z.string().length(4);
		const result = zocker(chained_schema).generate();
		expect(() => result_schema.parse(result)).not.toThrow();
	});

	it("Generates valid data for numbers with transforms", () => {
		const doubled = z
			.number()
			.int()
			.positive()
			.transform((s) => s * 2);

		const even_schema = z.number().int().positive().multipleOf(2);

		for (let i = 0; i < 100; i++) {
			const result = zocker(doubled).generate();
			expect(() => even_schema.parse(result)).not.toThrow();
		}
	});
});
