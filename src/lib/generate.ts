import { z } from "zod";
import {
	NoGeneratorException,
	RecursionLimitReachedException
} from "./exceptions.js";

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
import { generate_enum } from "./generators/enum.js";
import { generate_native_enum } from "./generators/native-enum.js";
import { generate_optional } from "./generators/optional.js";
import { generate_nullable } from "./generators/nullable.js";
import { generate_any } from "./generators/any.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {
	generators: Map<z.ZodSchema, () => any>;

	/** A factory function for generating values for z.instanceof */
	instanceof_factories: Map<any, () => any>;

	null_chance: number;
	undefined_chance: number;
	default_chance: number;
	recursion_limit: number;

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
	 * This is used to detect and count circular references.
	 */
	parent_schemas: Map<z.ZodSchema, number>;
	seed: number;
};

export type Generator<Z extends z.ZodSchema> = (
	schema: Z,
	ctx: GenerationContext<Z>
) => z.infer<Z>;

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
	const previous_parent_schemas = prev_generation_context.parent_schemas;
	const current_recursion_depth = previous_parent_schemas.get(schema) ?? 0;

	if (current_recursion_depth >= prev_generation_context.recursion_limit) {
		throw new RecursionLimitReachedException("Recursion limit reached");
	}

	const parent_schemas = new Map(previous_parent_schemas);
	parent_schemas.set(schema, current_recursion_depth + 1);

	//Create a new generation context for this schema
	const generation_context: GenerationContext<Z> = {
		...prev_generation_context,
		parent_schemas
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

		if (schema instanceof z.ZodUnknown)
			return generate_any(schema, generation_context);

		if (schema instanceof z.ZodAny)
			return generate_any(schema, generation_context);

		if (schema instanceof z.ZodNaN) return NaN;

		if (schema instanceof z.ZodSymbol) return Symbol();

		if (schema instanceof z.ZodEffects)
			return generate_effects(schema, generation_context);

		if (schema instanceof z.ZodObject)
			return generate_object(schema, generation_context);

		if (schema instanceof z.ZodArray)
			return generate_array(schema, generation_context);

		if (schema instanceof z.ZodNullable)
			return generate_nullable(schema, generation_context);

		if (schema instanceof z.ZodOptional)
			return generate_optional(schema, generation_context);

		if (schema instanceof z.ZodUnion)
			return generate_union(schema, generation_context);

		if (schema instanceof z.ZodDiscriminatedUnion)
			return generate_discriminated_union(schema, generation_context);

		if (schema instanceof z.ZodEnum)
			return generate_enum(schema, generation_context);

		if (schema instanceof z.ZodNativeEnum)
			return generate_native_enum(schema, generation_context);

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
			throw new NoGeneratorException(
				"ZodPipeline does not yet have a generator - You can provide a custom generator in the options to generate values anyway."
			);

		if (schema instanceof z.ZodNever)
			throw new NoGeneratorException(
				"We currently don't have a generator for support ZodNever."
			);

		if (schema instanceof z.ZodFunction)
			throw new NoGeneratorException(
				"ZodFunction does not yet have a generator -  You can provide a custom generator in the options to generate values anyway."
			);

		if (schema instanceof z.ZodDefault) {
			const should_use_default = weighted_random_boolean(
				generation_context.default_chance
			);
			const default_value = schema._def.defaultValue;
			return should_use_default
				? default_value()
				: generate(schema._def.innerType, generation_context);
		}

		throw new NoGeneratorException(
			`Zocker currently doesn't have a native generator for ${schema._type} - You can provide a custom generator in the options.`
		);
	} catch (error) {
		throw error;
	}
}
