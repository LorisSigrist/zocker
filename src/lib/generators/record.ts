import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { RecursionLimitReachedException } from "../exceptions.js";

export const generate_record: Generator<z.ZodRecord> = (
	schema,
	generation_context
) => {
	const size = faker.datatype.number({ min: 0, max: 10 });

	type Key = z.infer<(typeof schema)["_def"]["keyType"]>;
	type Value = z.infer<(typeof schema)["_def"]["valueType"]>;

	const record = {} as any as Record<Key, Value>;

	try {
		const keys: Key[] = [];
		for (let i = 0; i < size; i++) {
			const key = generate(schema._def.keyType, generation_context) as Key;
			keys.push(key);
		}

		for (let i = 0; i < size; i++) {
			let value: Value;

			try {
				generation_context.path.push(keys[i]!);
				generation_context.semantic_context.push("key");

				value = generate(schema._def.valueType, generation_context) as Value;
			} finally {
				generation_context.path.pop();
				generation_context.semantic_context.pop();
			}

			record[keys[i]!] = value;
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) return record;
		throw error;
	}

	return record;
};
