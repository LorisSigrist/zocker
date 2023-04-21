import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const object_schema = z.object({
	a: z.string(),
	b: z.number(),
	c: z.boolean()
});

const partial_object = object_schema.partial();

const generate = zocker(partial_object);

describe("Partial object generation", () => {
	it("should sometimes make some properties optional, if the schema is partial", () => {
		const data = generate({
			probabilities: {
				undefined_chance: 1
			}
		});
		expect(data).toEqual({
			a: undefined,
			b: undefined,
			c: undefined
		});
	});

	it("should not make properties undefined, if the undefined chance is 0", () => {
		const data = generate({
			probabilities: {
				undefined_chance: 0
			}
		});
		expect(() => object_schema.parse(data)).not.toThrow();
	});
});
