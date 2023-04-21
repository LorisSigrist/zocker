import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export const generate_object = <T extends z.ZodRawShape>(
	object_schema: z.ZodObject<T>,
	generation_context: GenerationContext<z.ZodObject<T>>
): z.infer<z.ZodObject<T>> => {
	type Shape = z.infer<typeof object_schema>;

	const mock_entries = [] as [keyof Shape, any][];

	Object.entries(object_schema.shape).forEach((entry) => {
		type Key = keyof Shape;
		type Value = Shape[keyof Shape];

		const key = entry[0] as Key;
		const property_schema = entry[1] as Value;
		const generated_value = generate(property_schema, generation_context);

		mock_entries.push([key, generated_value]);
	});

	return Object.fromEntries(mock_entries) as Shape;
};
