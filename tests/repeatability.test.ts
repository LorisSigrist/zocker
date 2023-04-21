import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const schema = z.object({
	name: z.string(),
	age: z.number(),
	isAwesome: z.boolean(),
	addresses: z.array(
		z.object({
			street: z.string(),
			city: z.string(),
			country: z.string().regex(/^[A-Z]{2}$/)
		})
	)
});

const generate = zocker(schema);

describe("repeatability", () => {
	it("should generate identcal values for the same seed", () => {
		const seed = 0;
		const first = generate({ seed });

		for (let i = 0; i < 10; i++) {
			const next = generate({ seed });
			expect(next).toEqual(first);
		}
	});

	it("should generate different values for different seeds", () => {
		const first = generate({ seed: 0 });
		const second = generate({ seed: 1 });

		expect(first).not.toEqual(second);
	});
});
