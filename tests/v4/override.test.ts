import { describe, it, expect } from "vitest";
import { zocker } from "../../src";
import { z } from "zod/v4";

describe("Override", () => {
    it("works", () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
        })

        const generated = zocker(schema)
            .override("number", (schema) => 5)
            .generate();

        expect(generated.age).toBe(5);
    })
})