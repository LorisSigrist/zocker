import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const iso_schemas = {
    "iso date": z.iso.date(),
    "iso datetime": z.iso.datetime(),
    "iso time": z.iso.time(),
    "iso duration": z.iso.duration()
}

describe("ISO generation", () => {
    test_schema_generation(iso_schemas);
})
