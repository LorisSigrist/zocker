import { z } from "zod";

import { generate_string } from "./generators/string.js";
import { generate_number } from "./generators/numbers.js";
import { generate_date } from "./generators/dates.js";
import { generate_bigint } from "./generators/bigint.js";
import { generate_object } from "./generators/object.js";
import { generate_array } from "./generators/array.js";
import { generate_effects } from "./generators/effects.js";
import { generate_tuple } from "./generators/tuple.js";
import { generate_map } from "./generators/map.js";
import { generate_record } from "./generators/record.js";
import { generate_set } from "./generators/set.js";
import { generate_union } from "./generators/union.js";
import { generate_discriminated_union } from "./generators/discriminated-union.js";
import { generate_boolean } from "./generators/boolean.js";
import { weighted_random_boolean } from "./utils/random.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {
	generators: Map<z.ZodSchema, () => any>;

	/** A factory function for generating values for z.instanceof */
	instanceof_factories: Map<any, () => any>;

	/** How likely is it that a nullable value will be null */
	null_chance: number;

	/** How likely is it that an optional value will be undefined */
	undefined_chance: number;

	/**
	 * The path to the value that is currently being generated (including the value)
	 *
	 * Usefull for generating helpful error messages.
	 * @example ["user", "profile", "description"]
	 */
	path: string[];

	/**
	 * The semantic context of the value that is currently being generated.
	 *
	 * Usefull for generating semantically meaningful values.
	 * E.g Generate actual street names for a string and not just random strings.
	 *
	 * @example ["address", "street"]
	 */
	semantic_context: [];

	/**
	 * Keep track of all the parent schemas of the current schema.
	 * This is used to detect circular references.
	 */
	parent_schemas: Set<z.ZodSchema>;
};

/**
 * Generate a random value that matches the given schema.
 * This get's called recursively until schema generation is done.
 *
 * @param schema - The schema to generate a value for.
 * @param generation_context - The context and configuration for the generation process.
 * @returns - A random value that matches the given schema.
 */
export function generate<Z extends z.ZodSchema>(
	schema: Z,
	prev_generation_context: GenerationContext<Z>
): z.infer<Z> {
	//Create a new generation context for this schema
	const generation_context: GenerationContext<Z> = {
		...prev_generation_context
	};

	try {
		//Check if there is a custom generator for this schema and use it if there is.
		const custom_generator = generation_context.generators.get(schema);
		if (custom_generator) return custom_generator();

		if (schema instanceof z.ZodNumber)
			return generate_number(schema, generation_context);

		if (schema instanceof z.ZodString)
			return generate_string(schema, generation_context);

		if (schema instanceof z.ZodBoolean)
			return generate_boolean(schema, generation_context);

		if (schema instanceof z.ZodDate)
			return generate_date(schema, generation_context);

		if (schema instanceof z.ZodBigInt)
			return generate_bigint(schema, generation_context);

		if (schema instanceof z.ZodUndefined) return undefined;

		if (schema instanceof z.ZodNull) return null;

		if (schema instanceof z.ZodVoid) return;

		if (schema instanceof z.ZodLiteral) return schema._def.value;

		if (schema instanceof z.ZodUnknown) return undefined;

		if (schema instanceof z.ZodAny) return undefined;

		if (schema instanceof z.ZodNaN) return NaN;

		if (schema instanceof z.ZodSymbol) return Symbol();

		if (schema instanceof z.ZodNever)
			throw new Error("We currently don't support ZodNever.");

		if (schema instanceof z.ZodEffects)
			return generate_effects(schema, generation_context);

		if (schema instanceof z.ZodObject)
			return generate_object(schema, generation_context);

		if (schema instanceof z.ZodArray) {
			return generate_array(schema, generation_context);
		}

		if (schema instanceof z.ZodNullable) {
			const should_be_null = weighted_random_boolean(generation_context.null_chance);
			return should_be_null ? null : generate(schema._def.innerType, generation_context);
		}

		if (schema instanceof z.ZodOptional) {
			const should_be_undefined = weighted_random_boolean(generation_context.undefined_chance);
			return should_be_undefined ? undefined : generate(schema._def.innerType, generation_context);
		}

		if (schema instanceof z.ZodUnion)
			return generate_union(schema, generation_context);

		if (schema instanceof z.ZodDiscriminatedUnion)
			return generate_discriminated_union(schema, generation_context);

		if (schema instanceof z.ZodEnum) {
			const values = schema._def.values;
			const random_value = values[Math.floor(Math.random() * values.length)];
			return random_value;
		}

		if (schema instanceof z.ZodNativeEnum) {
			const values = Object.values(schema._def.values);
			const random_value = values[Math.floor(Math.random() * values.length)];
			return random_value;
		}

		if (schema instanceof z.ZodTuple)
			return generate_tuple(schema, generation_context);

		if (schema instanceof z.ZodPromise)
			return Promise.resolve(generate(schema._def.type, generation_context));


		if (schema instanceof z.ZodBranded)
			return generate(schema._def.type, generation_context);

		if (schema instanceof z.ZodMap)
			return generate_map(schema, generation_context);

		if (schema instanceof z.ZodSet)
			return generate_set(schema, generation_context);

		if (schema instanceof z.ZodLazy)
			return generate(schema._def.getter(), generation_context);

		if (schema instanceof z.ZodRecord)
			return generate_record(schema, generation_context);

		if (schema instanceof z.ZodPipeline)
			throw new Error(
				"ZodPipeline is not supported yet. You can provide a custom generator in the options to generate values anyway."
			);

		if (schema instanceof z.ZodFunction)
			throw new Error(
				"ZodFunction is not supported yet. You can provide a custom generator in the options to generate values anyway."
			);

		throw new Error(
			`The Zod Type ${schema._type} is not yet supported - You can provide a custom generator in the options.`
		);
	} catch (error) {
		throw error;
	}
}
