import { describe } from "vitest";
import { test_schema_generation } from "./utils";
import { z } from "zod";

const Person = z.object({
	name: z.string(),
	children: z
		.array(z.lazy(() => Person))
		.max(5)
		.default([])
});

const Partial_Tree = z
	.object({
		name: z.string().max(10),
		children: z
			.array(z.lazy(() => Partial_Tree))
			.min(1)
			.max(4) //The min is to guarantee that the recursion doesn't stop with empty arrays
	})
	.partial();

const Union_Tree = z.object({
	name: z.string(),
	children: z
		.union([z.lazy(() => Union_Tree), z.string()])
		.array()
		.min(1)
});

const Discriminated_Union_Tree = z.object({
	name: z.string(),
	children: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("tree"),
			children: z
				.lazy(() => Discriminated_Union_Tree)
				.array()
				.min(1)
		}),
		z.object({ type: z.literal("leaf"), value: z.string() })
	])
});

const cyclic_schemas = {
	Tree: Person,
	"Partial Tree": Partial_Tree,
	"Union Tree": Union_Tree,
	"Discriminated Union Tree": Discriminated_Union_Tree
};

describe("Cyclic Schemas", () => {
	test_schema_generation(cyclic_schemas, 10);
});
