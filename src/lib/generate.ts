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
import { generate_enum } from "./generators/enum.js";
import { generate_native_enum } from "./generators/native-enum.js";
import { generate_optional } from "./generators/optional.js";
import { generate_nullable } from "./generators/nullable.js";
import { generate_any } from "./generators/any.js";
import { generate_symbol } from "./generators/symbol.js";
import { generate_default } from "./generators/default.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {
	instanceof_generators: {
		types: any[];
		generators: Generator<any>[];
	};


	reference_generators: {
		types: any[];
		generators: Generator<any>[];
	};

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
	
	const custom_generator_index = generation_context.reference_generators.types.findIndex(val => schema === val);
	if (custom_generator_index !== -1) return generation_context.reference_generators.generators[custom_generator_index]!(schema, generation_context);

	const instanceof_generator_index = generation_context.instanceof_generators.types.findIndex(val => schema instanceof val);
	if (instanceof_generator_index !== -1) return generation_context.instanceof_generators.generators[instanceof_generator_index]!(schema, generation_context);
	
	throw new NoGeneratorException(`No generator for schema ${schema} - You can provide a custom generator in the zocker options`);
}
