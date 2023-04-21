import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { weighted_random_boolean } from "../utils/random.js";

export const generate_default: Generator<z.ZodDefault<any>> = (schema, ctx) => {
	const should_use_default = weighted_random_boolean(ctx.default_chance);
	const default_value = schema._def.defaultValue;
	return should_use_default
		? default_value()
		: generate(schema._def.innerType, ctx);
};
