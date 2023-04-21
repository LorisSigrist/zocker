import { faker } from "@faker-js/faker";
import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export const generate_array = <T extends z.ZodTypeAny>(
	array_schema: z.ZodArray<T>,
	generation_context: GenerationContext<z.ZodArray<T>>
) => {
	const exact_length = array_schema._def.exactLength?.value ?? null;

	const min = array_schema._def.minLength
		? array_schema._def.minLength.value
		: 0;
	const max = array_schema._def.maxLength
		? array_schema._def.maxLength.value
		: min + 10;

	const length =
		exact_length !== null ? exact_length : faker.datatype.number({ min, max });

	const generated_array = [] as z.infer<T>[];

	for (let i = 0; i < length; i++) {
		const generated_value = generate(array_schema.element, generation_context);
		generated_array.push(generated_value);
	}

	return generated_array;
};
