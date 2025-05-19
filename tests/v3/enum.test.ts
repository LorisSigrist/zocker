import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

enum NativeEnum {
	hello = "hello",
	world = "world"
}

const enum_schemas = {
	enum: z.enum(["hello", "world"]),
	"native enum": z.nativeEnum(NativeEnum)
} as const;

describe("Enum generation", () => {
	test_schema_generation(enum_schemas);
});
