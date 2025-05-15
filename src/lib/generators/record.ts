import { faker } from "@faker-js/faker";
import { GenerationContext, Generator, generate } from "../generate.js";
import * as z from "zod/v4/core";
import { RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type RecordOptions = {
	max: number;
	min: number;
};

const generate_record: Generator<z.$ZodRecord> = (schema, ctx) => {
	const size = faker.datatype.number({
		min: ctx.record_options.min,
		max: ctx.record_options.max
	});

	type Key = z.infer<(typeof schema)["_zod"]["def"]["keyType"]>;
	type Value = z.infer<(typeof schema)["_zod"]["def"]["valueType"]>;

	const record = {} as any as Record<Key, Value>;

	try {
		const keys = generateKeys<typeof schema>(schema, ctx) as unknown as Key[];

		for (const key of keys) {
			let value: Value;
			let prev_semantic_context = ctx.semantic_context;

			try {
				ctx.path.push(key);
				ctx.semantic_context = "key";

				value = generate(schema._zod.def.valueType, ctx) as Value;
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

/**
 * Geneartes keys for a record
 * @param schema 
 * @param ctx 
 */
function generateKeys<Z extends z.$ZodRecord>(
	schema: Z,
	ctx: GenerationContext<z.$ZodRecord>
): z.infer<Z>[] {
	const keySchema = schema._zod.def.keyType;


	if (keySchema instanceof z.$ZodEnum) {
		// if the key schema is an enum
		// all enum cases must be generated

		//return keySchema._zod.def.entries;
	}

	// otherwise, pick a random number of keys
	const numKeys = faker.datatype.number({
		min: ctx.record_options.min,
		max: ctx.record_options.max
	});

	const keys: z.infer<Z>[] = [];
	for (let i = 0; i < numKeys; i++) {
		const key = generate(schema._zod.def.keyType, ctx) as unknown as z.infer<Z>;
		keys.push(key);
	}

	return keys;
}

export const RecordGenerator: InstanceofGeneratorDefinition<z.$ZodRecord> = {
	schema: z.$ZodRecord as any,
	generator: generate_record,
	match: "instanceof"
};
