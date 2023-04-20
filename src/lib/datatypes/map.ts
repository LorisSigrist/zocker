import { faker } from "@faker-js/faker";
import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export function generate_map<Z extends z.ZodMap>(
	schema: Z,
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	const size = faker.datatype.number({ min: 0, max: 10 });

	const map = new Map<
		z.infer<Z["_def"]["keyType"]>,
		z.infer<Z["_def"]["valueType"]>
	>();

	for (let i = 0; i < size; i++) {
		const key = generate(schema._def.keyType, generation_context);
		const value = generate(schema._def.valueType, generation_context);
		map.set(key, value);
	}

	return map;
}
