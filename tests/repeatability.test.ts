import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const schema = z.object({
	name: z.string(),
	age: z.number(),
	email: z.string().email(),
	isAwesome: z.boolean(),
	addresses: z.array(
		z.object({
			street: z.string(),
			city: z.string(),
			country: z.string().regex(/^[A-Z]{2}$/)
		})
	),
	id: z.string().uuid(),
	cuid: z.string().cuid(),
	cuid2: z.string().cuid2(),
	ulid: z.string().ulid()
});

describe("repeatability", () => {
	it("should generate identcal values for the same seed", () => {
		const seed = 0;
		const first = zocker(schema, { seed });

		for (let i = 0; i < 10; i++) {
			const next = zocker(schema, { seed });
			expect(next).toEqual(first);
		}
	});

	it("should generate different values for different seeds", () => {
		const first = zocker(schema, { seed: 0 });
		const second = zocker(schema, { seed: 1 });

		expect(first).not.toEqual(second);
	});

	it("should generate different values if the seed is not specified", () => {
		const first = zocker(schema);
		const second = zocker(schema);

		expect(first).not.toEqual(second);
	});
});
