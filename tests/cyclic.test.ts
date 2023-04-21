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

const cyclic_schemas = {
	Tree: Person,
	"Partial Tree": Partial_Tree
};

describe("Cyclic Schemas", () => {
	test_schema_generation(cyclic_schemas, 10);
});
