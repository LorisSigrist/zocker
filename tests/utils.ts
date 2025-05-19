import { test, expect } from "vitest";
import { z as z4 } from "zod/v4";
import * as z from "zod/v4/core"
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
					let result = schema['~standard'].validate(data);
					result = result as Awaited<typeof result>;
					if (result.issues) {
						console.log("Invalid Data Generated", data, result.issues);
					}
				} catch (e) {
					throw e;
				}
			}).not.toThrow();
		}
	});
}
