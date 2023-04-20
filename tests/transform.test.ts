import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const transform_schemas = {
    "doubled number": z.number().transform((n) => n * 2),
    "doubled string": z.string().transform((s) => s + s),
} as const;

describe.skip("Transform generation", () => {
    test_schema_generation(transform_schemas);
});