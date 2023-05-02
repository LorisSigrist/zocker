import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { RecursionLimitReachedException } from "../exceptions.js";
import { GeneratorDefinitionFactory } from "lib/zocker.js";

type RecordOptions = {
	max: number;
	min: number;
};

const default_record_options: RecordOptions = {
	max: 10,
	min: 0
};

export const RecordGenerator: GeneratorDefinitionFactory<
	z.ZodRecord,
	Partial<RecordOptions>
> = (partial_options = {}) => {
	const options = { ...default_record_options, ...partial_options };

	const generate_record: Generator<z.ZodRecord> = (
		schema,
		generation_context
	) => {
		const size = faker.datatype.number({ min: options.min, max: options.max });

		type Key = z.infer<(typeof schema)["_def"]["keyType"]>;
		type Value = z.infer<(typeof schema)["_def"]["valueType"]>;

		const record = {} as any as Record<Key, Value>;

		try {
			const keys: Key[] = [];
			for (let i = 0; i < size; i++) {
				const key = generate(schema._def.keyType, generation_context) as Key;
				keys.push(key);
			}

			for (const key of keys) {
				let value: Value;
				let prev_semantic_context = generation_context.semantic_context;

				try {
					generation_context.path.push(key);
					generation_context.semantic_context = "key";

					value = generate(schema._def.valueType, generation_context) as Value;
				} finally {
					generation_context.path.pop();
					generation_context.semantic_context = prev_semantic_context;
				}

				record[key] = value;
			}
		} catch (error) {
			if (error instanceof RecursionLimitReachedException) return record;
			throw error;
		}

		return record;
	};

	return {
		schema: options.schema ?? (z.ZodRecord as any),
		generator: generate_record,
		match: options.match ?? "instanceof"
	};
};
