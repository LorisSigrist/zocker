import { GeneratorDefinitionFactory } from "../zocker.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

type NullableOptions = {
	null_chance: number;
};

const default_options: NullableOptions = {
	null_chance: 0.3
};

export const NullableGenerator: GeneratorDefinitionFactory<
	z.ZodNullable<any>,
	Partial<NullableOptions>
> = (partial_options = {}) => {
	const options = { ...default_options, ...partial_options };

	return {
		schema: options.schema ?? (z.ZodNullable as any),
		generator: (schema, generation_context) => {
			const should_be_null = weighted_random_boolean(options.null_chance);

			try {
				return should_be_null
					? null
					: generate(schema._def.innerType, generation_context);
			} catch (e) {
				if (e instanceof RecursionLimitReachedException) {
					return null;
				} else {
					throw e;
				}
			}
		},
		match: options.match ?? "instanceof"
	};
};
