import * as z from "zod/v4/core";
import {
	NoGeneratorException,
	RecursionLimitReachedException
} from "./exceptions.js";
import {
	InstanceofGeneratorDefinition,
	ReferenceGeneratorDefinition
} from "./zocker.js";
import { SemanticFlag } from "./semantics.js";
import { NumberGeneratorOptions } from "./generators/numbers.js";
import { OptionalOptions } from "./generators/optional.js";
import { NullableOptions } from "./generators/nullable.js";
import { DefaultOptions } from "./generators/default.js";
import { MapOptions } from "./generators/map.js";
import { RecordOptions } from "./generators/record.js";
import { SetOptions } from "./generators/set.js";
import { AnyOptions } from "./generators/any.js";
import { ArrayOptions } from "./generators/array.js";
import { ObjectOptions } from "./generators/object.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.$ZodType> = {
	instanceof_generators: InstanceofGeneratorDefinition<any>[];
	reference_generators: ReferenceGeneratorDefinition<any>[];

	/** A Map that keeps count of how often we've seen a parent schema - Used for cycle detection */
	parent_schemas: Map<z.$ZodType, number>;
	recursion_limit: number;

	path: (string | number | symbol)[];
	semantic_context: SemanticFlag;

	seed: number;

	number_options: NumberGeneratorOptions;
	optional_options: OptionalOptions;
	nullable_options: NullableOptions;
	default_options: DefaultOptions;
	map_options: MapOptions;
	record_options: RecordOptions;
	set_options: SetOptions;
	any_options: AnyOptions;
	unknown_options: AnyOptions;
	array_options: ArrayOptions;
	object_options: ObjectOptions;
};

export type Generator<Z extends z.$ZodType> = (
	schema: Z,
	ctx: GenerationContext<Z>
) => z.infer<Z>;

/**
 * Generate a random value that matches the given schema.
 * This get's called recursively until schema generation is done.
 *
 * @param schema - The schema to generate a value for.
 * @param ctx - The context and configuration for the generation process.
 * @returns - A pseudo-random value that matches the given schema.
 */
export function generate<Z extends z.$ZodType>(
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

const generate_value: Generator<z.$ZodType> = (schema, generation_context) => {
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
		`No generator for schema ${schema._zod.def.type} - You can provide a custom generator in the zocker options`
	);
};

function increment_recursion_count<Z extends z.$ZodType>(
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

function decrement_recursion_count<Z extends z.$ZodType>(
	schema: Z,
	ctx: GenerationContext<Z>
) {
	const previous_depth = ctx.parent_schemas.get(schema) ?? 0;
	const current_depth = previous_depth - 1;

	ctx.parent_schemas.set(schema, current_depth);
}
