import { z } from "zod";
import { GenerationContext, generate, Generator } from "./generate.js";
import { faker } from "@faker-js/faker";
import { default_generators } from "./default_generators.js";

/**
 * A factory function that creates a GeneratorDefinition with the given options.
 */
export type GeneratorDefinitionFactory<Z extends z.ZodSchema, O extends {} = {}> = (options?: O & {
	match?: "instanceof" | "reference"
	schema?: Z
}) => GeneratorDefinition<Z>;

/**
 * A definition of a generator and when it should be used.
 */
export type GeneratorDefinition<Z extends z.ZodSchema> = {
	schema: Z;
	generator: Generator<Z>;
	match: "instanceof" | "reference";
};

export type ZockerOptions = {
	/** A list of generators to use for generation. This will be appended by the built-in generators */
	generators?: GeneratorDefinition<any>[];
	/** The seed to use for the random number generator */
	seed?: number;

	/** The maximum number of times a schema can be cyclically generated */
	recursion_limit?: number;
};

/**
 * Create a Zocker-Function from a Zod-Schema that generates random test-data.
 * @param schema A Zod-Schema
 * @returns A Zocker-Function that can be used to generate random data that matches the schema.
 */
export function zocker<Z extends z.ZodSchema>(
	schema: Z,
	options: ZockerOptions = {}
): z.infer<Z> {


	//add the default generators to the list of generators
	const generators: GeneratorDefinition<Z>[] = [...(options.generators ?? []), ...default_generators]

	//Split the generators into instanceof and reference generators
	const reference_generators = generators.filter(g => g.match === "reference");
	const instanceof_generators = generators.filter(g => g.match === "instanceof");

	//Set the seed for the random number generator
	const seed = options.seed ?? Math.random() * 10_000_000;
	faker.seed(seed);

	const root_generation_context: GenerationContext<Z> = {
		reference_generators,
		instanceof_generators,
		recursion_limit: options.recursion_limit ?? 5,

		path: [],
		semantic_context: [],
		parent_schemas: new Map(),
		seed
	};

	return generate(schema, root_generation_context);
}
