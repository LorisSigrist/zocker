import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

enum NativeEnum {
	HELO = "hello",
	WW = "world"
}

const enum_schemas = {
	enum: z.enum(["hello", "world"]),
	"native enum": z.enum(NativeEnum),
	"enum exclude": z.enum(["hello", "world"]).exclude(["hello"]),
	"native enum exclude": z.enum(NativeEnum).exclude(["HELO"])
} as const;

describe("Enum generation", () => {
	test_schema_generation(enum_schemas);
});
