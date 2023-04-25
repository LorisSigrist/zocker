import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { weighted_random_boolean } from "../utils/random.js";

export function Default(
	default_chance: number = 0.3
): Generator<z.ZodDefault<any>> {
	return (schema, ctx) => {
		const should_use_default = weighted_random_boolean(default_chance);
		const default_value = schema._def.defaultValue;
		return should_use_default
			? default_value()
			: generate(schema._def.innerType, ctx);
	};
}
