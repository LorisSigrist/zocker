import { describe, expect, it } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";
import { zocker } from "../src";

const any_schemas = {
    "plain any": z.any()
} as const;

describe("Any generation", () => {
    test_schema_generation(any_schemas);

    /*
    This doesn't work because of Symbol equality issues.
    it("generates 'any' values deterministically", () => {
        const schema = z.any();
        const generate = zocker(schema);

        for (let i = 0; i < 100; i++) {
            const first = generate({ seed: i });
            const second = generate({ seed: i });
            expect(first).approximately(second);
        }
    });
    */
});