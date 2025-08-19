import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod/v3";
import { RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type RecordOptions = {
	max: number;
	min: number;
};

const generate_record: Generator<z.ZodRecord> = (schema, ctx) => {
	const size = faker.number.int({
		min: ctx.record_options.min,
		max: ctx.record_options.max
	});

	type Key = z.infer<(typeof schema)["_def"]["keyType"]>;
	type Value = z.infer<(typeof schema)["_def"]["valueType"]>;

	const record = {} as any as Record<Key, Value>;

	try {
		const keys: Key[] = [];
		for (let i = 0; i < size; i++) {
			const key = generate(schema._def.keyType, ctx) as Key;
			keys.push(key);
		}

		for (const key of keys) {
			let value: Value;
			let prev_semantic_context = ctx.semantic_context;

			try {
				ctx.path.push(key);
				ctx.semantic_context = "key";

				value = generate(schema._def.valueType, ctx) as Value;
			} finally {
				ctx.path.pop();
				ctx.semantic_context = prev_semantic_context;
			}

			record[key] = value;
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) return record;
		throw error;
	}

	return record;
};

export const RecordGenerator: InstanceofGeneratorDefinition<z.ZodRecord> = {
	schema: z.ZodRecord as any,
	generator: generate_record,
	match: "instanceof"
};
