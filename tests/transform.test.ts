import { describe, expect, it } from "vitest";
import { zocker } from "../src";
import { z } from "zod";


describe("Transform generation", () => {

	it("Generates valid data for strings with transforms", () => {
		const chained_schema = z.string().length(2).transform((s) => s + s);
		const result_schema = z.string().length(4);
		const result = zocker(chained_schema)();
		expect(() => result_schema.parse(result)).not.toThrow();
	});

	it("Generates valid data for numbers with transforms", () => {
		const chained_schema = z.number().negative().transform((s) => s * s);
		const result_schema = z.number().positive();
		const result = zocker(chained_schema)();
		expect(() => result_schema.parse(result)).not.toThrow();
	});
});
