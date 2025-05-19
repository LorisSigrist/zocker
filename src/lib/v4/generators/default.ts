import { Generator, generate } from "../generate.js";
import * as z from "zod/v4/core";
import { weighted_random_boolean } from "../utils/random.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type DefaultOptions = {
	default_chance: number;
};

const generator: Generator<z.$ZodDefault<any>> = (schema, ctx) => {
	const should_use_default = weighted_random_boolean(
		ctx.default_options.default_chance
	);
	const default_value = schema._zod.def.defaultValue;
	return should_use_default
		? default_value
		: generate(schema._zod.def.innerType, ctx);
};

export const DefaultGenerator: InstanceofGeneratorDefinition<
	z.$ZodDefault<any>
> = {
	schema: z.$ZodDefault as any,
	generator: generator,
	match: "instanceof"
};
