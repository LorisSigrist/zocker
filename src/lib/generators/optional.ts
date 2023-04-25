import { RecursionLimitReachedException } from "../exceptions.js";
import { Generator, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export function Optional(
	undefined_chance: number = 0.3
): Generator<z.ZodOptional<any>> {
	return (schema, generation_context) => {
		const should_be_undefined = weighted_random_boolean(undefined_chance);

		try {
			return should_be_undefined
				? undefined
				: generate(schema._def.innerType, generation_context);
		} catch (e) {
			if (e instanceof RecursionLimitReachedException) {
				return undefined;
			} else {
				throw e;
			}
		}
	};
}
