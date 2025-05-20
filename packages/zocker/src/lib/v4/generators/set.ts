import * as z from "zod/v4/core";
import { faker } from "@faker-js/faker";
import { generate, Generator } from "../generate.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type SetOptions = {
	max: number;
	min: number;
};

const generate_set: Generator<z.$ZodSet<any>> = (schema, ctx) => {
	const size = faker.number.int({
		min: ctx.set_options.min,
		max: ctx.set_options.max
	});

	const set: z.infer<typeof schema> = new Set();

	try {
		for (let i = 0; i < size; i++) {
			try {
				ctx.path.push(i);
				const value = generate(schema._zod.def.valueType, ctx);
				set.add(value);
			} finally {
				ctx.path.pop();
			}
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) {
			return set;
		}
		throw error;
	}

	return set;
};

export const SetGenerator: InstanceofGeneratorDefinition<z.$ZodSet<any>> = {
	schema: z.$ZodSet as any,
	generator: generate_set,
	match: "instanceof"
};
