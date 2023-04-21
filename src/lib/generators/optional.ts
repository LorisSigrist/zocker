import { RecursionLimitReachedException } from "../exceptions.js";
import { GenerationContext, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export function generate_optional<Z extends z.ZodOptional<any>>(
	schema: Z,
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	const should_be_undefined = weighted_random_boolean(
		generation_context.undefined_chance
	);

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
}
