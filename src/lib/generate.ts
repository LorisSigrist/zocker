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
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	//Mutate the generation context (creating a new one was too expensive - this gets called a lot)
	//Make sure to undo the mutations after the generation is done (even if it fails)
	increment_recursion_count(schema, generation_context);
	try {
		//attempt to generate a value
		const generation_result = generate_value(schema, generation_context);

		decrement_recursion_count(schema, generation_context);
		return generation_result;
	} catch (e) {
		decrement_recursion_count(schema, generation_context);
		throw e;
	}
}

const generate_value: Generator<z.ZodSchema> = (schema, generation_context) => {
	let generated_value: any;
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

	if (!generated) {
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
	}

	if (!generated)
		throw new NoGeneratorException(
			`No generator for schema ${schema} - You can provide a custom generator in the zocker options`
		);

	return generated_value;
};

function increment_recursion_count<Z extends z.ZodSchema>(
	schema: Z,
	ctx: GenerationContext<Z>
) {
	const previous_depth = ctx.parent_schemas.get(schema) ?? 0;
	const current_depth = previous_depth + 1;

	if (current_depth >= ctx.recursion_limit) {
		throw new RecursionLimitReachedException("Recursion limit reached");
	}

	ctx.parent_schemas.set(schema, current_depth);
}

function decrement_recursion_count<Z extends z.ZodSchema>(
	schema: Z,
	ctx: GenerationContext<Z>
) {
	const previous_depth = ctx.parent_schemas.get(schema) ?? 0;
	const current_depth = previous_depth - 1;

	ctx.parent_schemas.set(schema, current_depth);
}
