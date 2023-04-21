import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { RecursionLimitReachedException } from "../exceptions.js";

export const generate_map: Generator<z.ZodMap> = (
	schema,
	generation_context
) => {
	const size = faker.datatype.number({ min: 0, max: 10 });

	const map = new Map<
		z.infer<(typeof schema)["_def"]["keyType"]>,
		z.infer<(typeof schema)["_def"]["valueType"]>
	>();

	try {
		for (let i = 0; i < size; i++) {
			const key = generate(schema._def.keyType, generation_context);
			const value = generate(schema._def.valueType, generation_context);
			map.set(key, value);
		}
	} catch (error) {
		if (error instanceof RecursionLimitReachedException) {
			return map;
		}
		throw error;
	}

	return map;
};
