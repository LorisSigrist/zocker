import { test, expect } from "vitest";
import type * as z from "@zod/core"
import { zocker } from "../src";

/**
 * Test a bunch of schemas for validity at once
 *
 * @param schemas - A record of schemas to test
 * @param repeats - How many times should each test be repeated? (default: 100)
 */
export function test_schema_generation(
	schemas: Record<string, z.$ZodType>,
	repeats: number = 100
) {
	const schema_keys = Object.keys(
		schemas
	) as any as readonly (keyof typeof schemas)[];

	test.concurrent.each(schema_keys)("generates valid data for %s", (key) => {
		const schema = schemas[key];
		for (let i = 0; i < repeats; i++) {
			const data = zocker(schema).generate();
			expect(() => {
				try {
					schema["~standard"].validate(data);
				} catch (e) {
					console.log("Invalid Data Generated", data);
					throw e;
				}
			}).not.toThrow();
		}
	});
}
