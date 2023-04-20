import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const bigint_schemas = {
    "plain bigint": z.bigint(),
    "bigint with max": z.bigint().max(3n),
    "bigint with min and max": z.bigint().min(10_000n).max(20_000n),
    "bigint with min and max negative": z.bigint().min(-20n).max(-10n),
    "bigint multiple of 10": z.bigint().multipleOf(10n)
} as const;

describe("BigInt generation", () => {
    test_schema_generation(bigint_schemas);
});