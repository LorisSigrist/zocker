import { z } from "zod";
import {
	NoGeneratorException,
	RecursionLimitReachedException
} from "./exceptions.js";

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
	path: string[];
	semantic_context: [];
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

	let generated_value: z.infer<Z>;
	let generated = false;

	const custom_generator_index =
		generation_context.reference_generators.types.findIndex(
			(val) => schema === val
		);
	if (custom_generator_index !== -1) {
		generated_value = generation_context.reference_generators.generators[
			custom_generator_index
		]!(schema, generation_context);
		generated = true;
	}

	const instanceof_generator_index =
		generation_context.instanceof_generators.types.findIndex(
			(val) => schema instanceof val
		);
	if (instanceof_generator_index !== -1) {
		generated_value = generation_context.instanceof_generators.generators[
			instanceof_generator_index
		]!(schema, generation_context);
		generated = true;
	}

	if (!generated)
		throw new NoGeneratorException(
			`No generator for schema ${schema} - You can provide a custom generator in the zocker options`
		);

	return generated_value!;
}
