import { z } from "zod";
import { GenerationContext, generate } from "../generate.js";
import { faker } from "@faker-js/faker";
import { RecursionLimitReachedException } from "../exceptions.js";

export function generate_discriminated_union<
	Z extends z.ZodDiscriminatedUnion<string, any>
>(schema: Z, generation_context: GenerationContext<Z>): z.infer<Z> {
	const schemas = schema._def.options as z.ZodTypeAny[];

	const possible_indexes = new Array(schemas.length).fill(0).map((_, i) => i);
	const indexes = faker.helpers.shuffle(possible_indexes);

	//Generate a value for the first schema that doesn't throw a RecursionLimitReachedException
	for (const index of indexes) {
		try {
			const schema = schemas[index]!;
			return generate(schema, generation_context);
		} catch (e) {
			if (e instanceof RecursionLimitReachedException) {
				continue;
			} else {
				throw e;
			}
		}
	}

	//If all schemas throw a RecursionLimitReachedException, then this schema cannot be generated
	//and we should throw a RecursionLimitReachedException
	throw new RecursionLimitReachedException();
}
