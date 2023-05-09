import { z } from "zod";
import { GenerationContext, generate, Generator } from "./generate.js";
import { faker } from "@faker-js/faker";
import { default_generators } from "./default_generators.js";
import { NumberGeneratorOptions } from "./generators/numbers.js";
import { OptionalOptions } from "./generators/optional.js";

/**
 * A factory function that creates a GeneratorDefinition with the given options.
 */
export type GeneratorDefinitionFactory<
	Z extends z.ZodSchema,
	O extends {} = {}
> = (
	options?: O & {
		match?: "instanceof" | "reference";
		schema?: Z;
	}
) => GeneratorDefinition<Z>;

/**
 * A definition of a generator and when it should be used.
 */
export type GeneratorDefinition<Z extends z.ZodSchema> = InstanceofGeneratorDefinition<Z> | ReferenceGeneratorDefinition<Z>
export type InstanceofGeneratorDefinition<Z extends z.ZodSchema> = {
	schema: Z;
	generator: Generator<Z>;
	match: "instanceof";
}

export type ReferenceGeneratorDefinition<Z extends z.ZodSchema> = {
	schema: Z;
	generator: Generator<Z>;
	match: "reference";
}

/**
 * Generate random* valid mock-data from a Zod-Schem
 * @param schema A Zod-Schema
 * @returns A Zocker-Function that can be used to generate random data that matches the schema.
 */
export function zocker<Z extends z.ZodSchema>(schema: Z) {
	return new Zocker(schema)
}

class Zocker<Z extends z.ZodSchema> {
	private instanceof_generators: GeneratorDefinition<any>[] = [...default_generators];
	private reference_generators: GeneratorDefinition<any>[] = [];
	private seed: number | undefined = undefined;
	private recursion_limit = 5;

	private number_options: NumberGeneratorOptions = {
		extreme_value_chance: 0.3
	}

	private optional_options: OptionalOptions = {
		undefined_chance: 0.3
	}

	constructor(public schema: Z) {	}

	set<Z extends z.ZodSchema>(sub_schema: Z, generator: Generator<Z> | z.infer<Z>) {
		const next = this.clone();

		const generator_function = typeof generator == "function" ? generator : () => generator;

		next.reference_generators = [...next.reference_generators, {
			schema: sub_schema,
			generator : generator_function,
			match: "reference"
		}];

		return next;
	}

	setSeed(seed: number) {
		const next = this.clone();
		next.seed = seed;
		return next;
	}

	number(options: Partial<NumberGeneratorOptions>) {
		const next = this.clone();
		next.number_options = { ...next.number_options, ...options };
		return next;
	}

	optional(options: Partial<OptionalOptions>) {
		const next = this.clone();
		next.optional_options = { ...next.optional_options, ...options };
		return next;
	}

	generate(): z.infer<Z> {
		const ctx: GenerationContext<Z> = {
			reference_generators: this.reference_generators,
			instanceof_generators: this.instanceof_generators,
			recursion_limit: this.recursion_limit,
			path: [],
			semantic_context: "unspecified",
			parent_schemas: new Map(),
			seed: this.seed ?? Math.random() * 10_000_000,

			number_options: this.number_options,
			optional_options: this.optional_options
		};

		faker.seed(ctx.seed);
		return generate(this.schema, ctx);
	}

	private clone(): Zocker<Z> {
		return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this))
	}
}