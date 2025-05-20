import { z } from "zod";
import { Generator, generate } from "../generate.js";
import { faker } from "@faker-js/faker";
import { RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

const generate_discriminated_union: Generator<
	z.ZodDiscriminatedUnion<string, any>
> = (schema, ctx) => {
	const schemas = schema._def.options as z.ZodTypeAny[];

	const possible_indexes = new Array(schemas.length).fill(0).map((_, i) => i);
	const indexes = faker.helpers.shuffle(possible_indexes);

	//Generate a value for the first schema that doesn't throw a RecursionLimitReachedException
	for (const index of indexes) {
		try {
			ctx.path.push(index);
			const schema = schemas[index]!;
			return generate(schema, ctx);
		} catch (e) {
			if (e instanceof RecursionLimitReachedException) {
				continue;
			} else {
				throw e;
			}
		} finally {
			ctx.path.pop();
		}
	}

	//If all schemas throw a RecursionLimitReachedException, then this schema cannot be generated
	//and we should throw a RecursionLimitReachedException
	throw new RecursionLimitReachedException();
};

export const DiscriminatedUnionGenerator: InstanceofGeneratorDefinition<
	z.ZodDiscriminatedUnion<any, any>
> = {
	schema: z.ZodDiscriminatedUnion as any,
	generator: generate_discriminated_union,
	match: "instanceof"
};
