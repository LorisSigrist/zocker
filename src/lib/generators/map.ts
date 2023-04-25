import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { RecursionLimitReachedException } from "../exceptions.js";

export const generate_map: Generator<z.ZodMap> = (
	schema,
	generation_context
) => {
	const size = faker.datatype.number({ min: 0, max: 10 });

	type Key = z.infer<(typeof schema)["_def"]["keyType"]>;
	type Value = z.infer<(typeof schema)["_def"]["valueType"]>;

	const map = new Map<Key, Value>();

	try {
		const keys: Key[] = [];
		for (let i = 0; i < size; i++) {
			const key = generate(schema._def.keyType, generation_context);
			keys.push(key);
		}

		for (const key of keys) {
			try {
				generation_context.path.push(key);
				generation_context.semantic_context.push("key");

				const value = generate(schema._def.valueType, generation_context);
				map.set(key, value);
			} finally {
				generation_context.path.pop();
				generation_context.semantic_context.pop();
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
