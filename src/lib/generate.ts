import { z } from "zod";
import {
	NoGeneratorException,
	RecursionLimitReachedException
} from "./exceptions.js";
import { GeneratorDefinition } from "./zocker.js";
import { SemanticFlag } from "./semantics.js";
import { NumberGeneratorOptions } from "./generators/numbers.js";
import { OptionalOptions } from "./generators/optional.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {
	instanceof_generators: GeneratorDefinition<any>[];
	reference_generators: GeneratorDefinition<any>[];

	/** A Map that keeps count of how often we've seen a parent schema - Used for cycle detection */
	parent_schemas: Map<z.ZodSchema, number>;
	recursion_limit: number;

	path: (string | number | symbol)[];
	semantic_context: SemanticFlag;

	seed: number;

	number_options: NumberGeneratorOptions
	optional_options: OptionalOptions
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
 * @param ctx - The context and configuration for the generation process.
 * @returns - A random value that matches the given schema.
 */
export function generate<Z extends z.ZodSchema>(
	schema: Z,
	ctx: GenerationContext<Z>
): z.infer<Z> {
	increment_recursion_count(schema, ctx);
	try {
		return generate_value(schema, ctx);
	} finally {
		decrement_recursion_count(schema, ctx);
	}
}

const generate_value: Generator<z.ZodSchema> = (schema, generation_context) => {
	//Check if a reference generator is available for this schema
	const reference_generator = generation_context.reference_generators.find(
		(g) => g.schema === schema
	);
	if (reference_generator)
		return reference_generator.generator(schema, generation_context);

	//Check if an instanceof generator is available for this schema
	const instanceof_generator = generation_context.instanceof_generators.find(
		(g) => schema instanceof (g.schema as any)
	);
	if (instanceof_generator)
		return instanceof_generator.generator(schema, generation_context);

	throw new NoGeneratorException(
		`No generator for schema ${schema} - You can provide a custom generator in the zocker options`
	);
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
