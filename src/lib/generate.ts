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
	const previous_depth = generation_context.parent_schemas.get(schema) ?? 0;
	const current_depth = previous_depth + 1;

	if (current_depth >= generation_context.recursion_limit) {
		throw new RecursionLimitReachedException("Recursion limit reached");
	}

	generation_context.parent_schemas.set(schema, current_depth)

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


	//Undo any mutations to the generation context
	generation_context.parent_schemas.set(schema, previous_depth);

	if (!generated)
		throw new NoGeneratorException(
			`No generator for schema ${schema} - You can provide a custom generator in the zocker options`
		);

	return generated_value!;
}
