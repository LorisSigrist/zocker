import { GeneratorDefinitionFactory } from "../zocker.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export type OptionalOptions = {
	undefined_chance: number;
};

const default_options: OptionalOptions = {
	undefined_chance: 0.3
};

export const OptionalGenerator: GeneratorDefinitionFactory<
	z.ZodOptional<any>,
	Partial<OptionalOptions>
> = (partial_options = {}) => {
	const options = { ...default_options, ...partial_options };

	return {
		schema: options.schema ?? (z.ZodOptional as any),
		generator: (schema, ctx) => {
			const should_be_undefined = weighted_random_boolean(
				ctx.optional_options.undefined_chance
			);

			try {
				return should_be_undefined
					? undefined
					: generate(schema._def.innerType, ctx);
			} catch (e) {
				if (e instanceof RecursionLimitReachedException) {
					return undefined;
				} else {
					throw e;
				}
			}
		},
		match: options.match ?? "instanceof"
	};
};
