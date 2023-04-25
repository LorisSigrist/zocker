import { RecursionLimitReachedException } from "../exceptions.js";
import { Generator, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export function Nullable(
	null_chance: number = 0.3
): Generator<z.ZodNullable<any>> {
	return (schema, generation_context) => {
		const should_be_null = weighted_random_boolean(null_chance);

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
	};
}
