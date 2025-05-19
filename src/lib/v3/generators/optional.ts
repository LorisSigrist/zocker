import { InstanceofGeneratorDefinition } from "../zocker.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { Generator, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export type OptionalOptions = {
	undefined_chance: number;
};

const generator: Generator<z.ZodOptional<any>> = (schema, ctx) => {
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
};

export const OptionalGenerator: InstanceofGeneratorDefinition<
	z.ZodOptional<any>
> = {
	schema: z.ZodOptional as any,
	generator: generator,
	match: "instanceof"
};
