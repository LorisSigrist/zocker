import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const number_schemas = {
    "plain number": z.number(),
    "number with max": z.number().max(3),
    "number with min and max": z.number().min(10_000).max(20_000),
    "number with min and max negative": z.number().min(-20).max(-10),
    "integer with max": z.number().int().max(10),
    "integer with min and max": z.number().int().min(10_000).max(20_000),
    "integer with min and max negative": z.number().int().min(-20).max(-10),
} as const;

describe("Number generation", () => {
    test_schema_generation(number_schemas);
});