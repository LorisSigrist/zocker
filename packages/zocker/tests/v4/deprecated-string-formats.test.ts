import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const formatted_string_schemas = {
    "string.date": z.string().date(),
    "string.datetime": z.string().datetime(),
    "string.duration": z.string().duration(),
    "string.email": z.string().email(),
    "string.guid": z.string().guid(),
    "string.uuid": z.string().uuid(),
    "string.uuidv4": z.string().uuidv4(),
    "string.uuidv6": z.string().uuidv6(),
    "string.uuidv7": z.string().uuidv7(),
    "string.url": z.string().url(),
    "string.cuid": z.string().cuid(),
    "string.cuid2": z.string().cuid2(),
    "string.ulid": z.string().ulid(),
    "string.emoji": z.string().emoji(),
} as const;

describe("Deprecated string formats", () => {
	test_schema_generation(formatted_string_schemas);
});
