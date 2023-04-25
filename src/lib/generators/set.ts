import { z } from "zod";
import { faker } from "@faker-js/faker";
import { generate, Generator } from "../generate.js";
import { RecursionLimitReachedException } from "../exceptions.js";

export const generate_set: Generator<z.ZodSet<any>> = (
	schema,
	ctx
) => {
	const size = faker.datatype.number({ min: 0, max: 10 });

	const set: z.infer<typeof schema> = new Set();

	try {
		for (let i = 0; i < size; i++) {
			try {
				ctx.path.push(i);
				const value = generate(schema._def.valueType, ctx);
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
