import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../../src";
import { test_schema_generation } from "./utils";

const optional_schemas = {
	"optional number": z.number().optional(),
	"optional string": z.string().optional(),
	"optional boolean": z.boolean().optional(),
	"optional date": z.date().optional(),
	"optional object": z.object({}).optional(),
	"optional array": z.array(z.number()).optional()
} as const;

const requred_schema = z.number();
const optional_schema = requred_schema.optional();
const undefined_schema = z.undefined();

describe("Optional generation", () => {
	test_schema_generation(optional_schemas);

	it("only generates undefined if the undefined chance is 1", () => {
		for (let i = 0; i < 100; i++) {
			const data = zocker(optional_schema)
				.optional({ undefined_chance: 1 })
				.generate();
			expect(() => undefined_schema.parse(data)).not.toThrow();
		}
	});

	it("never generates undefined if the undefined chance is 0", () => {
		for (let i = 0; i < 100; i++) {
			const data = zocker(optional_schema)
				.optional({ undefined_chance: 0 })
				.generate();

			expect(() => requred_schema.parse(data)).not.toThrow();
		}
	});
});
