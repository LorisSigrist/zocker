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
			if (keys.includes(key)) throw new Error("Duplicate key");
			keys.push(key);
		}

		for (let i = 0; i < size; i++) {
			const value = generate(
				schema._def.valueType,
				generation_context
			) as Value;

			record[keys[i]!] = value;
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) return record;
		throw error;
	}

	return record;
};
