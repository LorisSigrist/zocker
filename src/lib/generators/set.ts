import { z } from "zod";
import { faker } from "@faker-js/faker";
import { generate, Generator } from "../generate.js";
import { RecursionLimitReachedException } from "../exceptions.js";
import { GeneratorDefinitionFactory } from "lib/zocker.js";

type SetOptions = {
	max: number;
	min: number;
};

const default_set_options: SetOptions = {
	max: 10,
	min: 0
};

export const SetGenerator: GeneratorDefinitionFactory<
	z.ZodSet<any>,
	Partial<SetOptions>
> = (partial_options = {}) => {
	const options = { ...default_set_options, ...partial_options };

	const generate_set: Generator<z.ZodSet<any>> = (schema, ctx) => {
		const size = faker.datatype.number({ min: options.min, max: options.max });

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

	return {
		schema: options.schema ?? (z.ZodSet as any),
		generator: generate_set,
		match: options.match ?? "instanceof"
	};
};
