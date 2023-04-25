import { describe, it, expect } from "vitest";
import { z } from "zod";
import { OptionalGenerator, zocker } from "../src";

const object_schema = z.object({
	a: z.string(),
	b: z.number(),
	c: z.boolean()
});

const partial_object = object_schema.partial();

describe("Partial object generation", () => {
	it("should make some properties optional, if the schema is partial", () => {
		const generate = zocker(partial_object, {
			generators: [
				OptionalGenerator({
					undefined_chance: 1
				})
			]
		});
		const data = generate();
		expect(data).toEqual({
			a: undefined,
			b: undefined,
			c: undefined
		});
	});

	it("should not make properties undefined, if the undefined chance is 0", () => {
		const generate = zocker(partial_object, {
			generators: [
				OptionalGenerator({
					undefined_chance: 0
				})
			]
		});
		const data = generate();
		expect(() => object_schema.parse(data)).not.toThrow();
	});
});
