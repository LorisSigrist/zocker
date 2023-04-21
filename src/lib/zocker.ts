import { z } from "zod";
import { GenerationContext, generate } from "./generate.js";
import { faker } from "@faker-js/faker";

export type ZockerOptions<Z extends z.ZodTypeAny> = {
	generators?: Map<z.ZodTypeAny, () => any>;
};

export type ZockerGeneratorOptions<Z extends z.ZodTypeAny> = {
	/** The seed to use for the random number generator */
	seed?: number;

	/** The maximum number of times a schema can be cyclically generated */
	recursion_limit?: number;

	/** Define the probabilities of certain generation decisions being made */
	probabilities?: {
		/** How likely is it that a nullable value will be null @default 0.3 */
		null_chance?: number;
		/** How likely is it that an optional value will be undefined @default 0.3 */
		undefined_chance?: number;
		/** How likely is it that a default value will be used if given @default 0.3 */
		default_chance?: number;
	};
};
export type Zocker<Z extends z.ZodTypeAny> = (
	options?: ZockerGeneratorOptions<Z>
) => z.infer<Z>;

/**
 * Create a Zocker-Function from a Zod-Schema that generates random test-data.
 * @param schema A Zod-Schema
 * @returns A Zocker-Function that can be used to generate random data that matches the schema.
 */
export function zocker<Z extends z.ZodSchema>(
	schema: Z,
	schema_options: ZockerOptions<Z> = {}
): Zocker<Z> {
	return function (generation_options = {}) {
		const seed = generation_options.seed ?? Math.random() * 10_000_000;

		faker.seed(seed);

		const root_generation_context: GenerationContext<Z> = {
			generators: schema_options.generators || new Map(),
			instanceof_factories: new Map(),

			null_chance: generation_options.probabilities?.null_chance ?? 0.3,
			undefined_chance: generation_options.probabilities?.undefined_chance ?? 0.3,
			default_chance: generation_options.probabilities?.default_chance ?? 0.3,
			recursion_limit: generation_options.recursion_limit ?? 3,

			path: [],
			semantic_context: [],
			parent_schemas: new Map(),
			seed
		};

		return generate(schema, root_generation_context);
	};
}
