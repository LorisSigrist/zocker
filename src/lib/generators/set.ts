import { z } from "zod";
import { faker } from "@faker-js/faker";
import { generate, Generator } from "../generate.js";
import { RecursionLimitReachedException } from "../exceptions.js";

export const generate_set: Generator<z.ZodSet<any>> = (
	schema,
	generation_context
) => {
	const size = faker.datatype.number({ min: 0, max: 10 });

	const set: z.infer<typeof schema> = new Set();

	try {
		for (let i = 0; i < size; i++) {
			const value = generate(schema._def.valueType, generation_context);
			set.add(value);
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) {
			return set;
		}
		throw error;
	}

	return set;
};
