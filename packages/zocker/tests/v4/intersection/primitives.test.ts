import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "../utils";

const intersection_schemas = {
	"intersection of two numbers": z.intersection(z.number(), z.number()),
	"intersection of two numbers with checks": z.intersection(
		z.number().min(10),
		z.number().max(20)
	),
	"intersection of two numbers with multipleof": z.intersection(
		z.number().min(10),
		z.number().multipleOf(2)
	),
	"intersection of two strings": z.intersection(z.string(), z.string()),
	"intersection of two strings with checks": z.intersection(
		z.string().min(10),
		z.string().max(20)
	),
	"intersection of two strings, one with regex": z.intersection(
		z.string().max(10),
		z.string().regex(/abc/)
	),
	"intersection of multiple literals": z.intersection(
		z.literal(["red", "green", "blue"]),
		z.literal(["blue"])
	),
	"intersection of two unions": z.intersection(
		z.union([z.string(), z.number()]),
		z.union([z.string(), z.number()])
	),
	"intersection of two enum unions": z.intersection(
		z.enum(["green", "blue"]),
		z.enum(["red", "green"])
	),
	"intersection of two arrays": z.intersection(
		z.array(z.number()),
		z.array(z.number().int())
	)
} as const;

describe("Intersection generation", () => {
	test_schema_generation(intersection_schemas);
});
