import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type MapOptions = {
	max: number;
	min: number;
};

const generate_map: Generator<z.ZodMap> = (schema, ctx) => {
	const size = faker.number.int({
		min: ctx.map_options.min,
		max: ctx.map_options.max
	});

	type Key = z.infer<(typeof schema)["_def"]["keyType"]>;
	type Value = z.infer<(typeof schema)["_def"]["valueType"]>;

	const map = new Map<Key, Value>();

	try {
		const keys: Key[] = [];
		for (let i = 0; i < size; i++) {
			const key = generate(schema._def.keyType, ctx);
			keys.push(key);
		}

		for (const key of keys) {
			let prev_semantic_context = ctx.semantic_context;
			try {
				ctx.path.push(key);
				ctx.semantic_context = "key";

				const value = generate(schema._def.valueType, ctx);
				map.set(key, value);
			} finally {
				ctx.path.pop();
				ctx.semantic_context = prev_semantic_context;
			}
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) {
			return map;
		}
		throw error;
	}

	return map;
};

export const MapGenerator: InstanceofGeneratorDefinition<z.ZodMap> = {
	schema: z.ZodMap as any,
	generator: generate_map,
	match: "instanceof"
};
