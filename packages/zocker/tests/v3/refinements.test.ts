import { describe, it } from "vitest";
import { z } from "zod";
import { zocker } from "../../src";

const refined_string = z.string().refine((s) => s.length > 5);
const object_with_refined_string = z.object({
	refined: refined_string,
	unrefined: z.string().max(5) //Making sure that unrefined strings are not affected.
});

describe("Provide a generation function for a schema (by reference)", () => {
	it("should generate a valid value", () => {
		const value = zocker(object_with_refined_string)
			.supply(refined_string, "123456")
			.generate();
		object_with_refined_string.parse(value);
	});
});
