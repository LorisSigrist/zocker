import { InstanceofGeneratorDefinition } from "../zocker.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { Generator, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import * as z from "@zod/core";

export type NullableOptions = {
	null_chance: number;
};

const generator: Generator<z.$ZodNullable<z.$ZodType>> = (schema, ctx) => {
	console.log(schema);
	
	const should_be_null = weighted_random_boolean(
		ctx.nullable_options.null_chance
	);

	try {
		return should_be_null ? null : generate(schema._zod.def.innerType, ctx);
	} catch (e) {
		if (e instanceof RecursionLimitReachedException) {
			return null;
		} else {
			throw e;
		}
	}
};

export const NullableGenerator: InstanceofGeneratorDefinition<
	z.$ZodNullable<z.$ZodType>
> = {
	schema: z.$ZodNullable as any,
	generator,
	match: "instanceof"
};
