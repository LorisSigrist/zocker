import { test, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";


/**
 * Test a bunch of schemas for validity at once
 * 
 * @param schemas - A record of schemas to test
 * @param repeats - How many times should each test be repeated? (default: 100)
 */
export function test_schema_generation(schemas: Record<string, z.ZodSchema>, repeats: number = 100) {
    const schema_keys = Object.keys(
        schemas
    ) as any as readonly (keyof typeof schemas)[];

    test.concurrent.each(schema_keys)("generates valid data for %s", (key) => {
        const schema = schemas[key];
        const generate = zocker(schema);
        for (let i = 0; i < repeats; i++) {
            const data = generate();
            expect(() => schema.parse(data)).not.toThrow();
        }
    });
}