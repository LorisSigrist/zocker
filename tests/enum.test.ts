import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

enum NativeEnum {
	hello = "hello",
	world = "world"
}

const enum_schemas = {
	enum: z.enum(["hello", "world"]),
	"native enum": z.enum(NativeEnum),
	"enum exclude": z.enum(["hello", "world"]).exclude(["hello"]),
	"native enum exclude": z.enum(NativeEnum).exclude(["hello"])
} as const;

describe("Enum generation", () => {
	test_schema_generation(enum_schemas);
});
